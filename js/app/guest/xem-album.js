/**
 * Trình xem album ảnh cưới.
 * Bấm vào lưới đại diện -> mở toàn bộ ảnh, vuốt/bấm để chuyển.
 */
export const xemAlbum = (() => {

    const DUONG_DAN = './assets/images/album/';

    /** @type {string[]} */
    let danhSach = [];
    let viTri = 0;

    /** @type {HTMLElement|null} */
    let hop = null;
    /** @type {HTMLImageElement|null} */
    let anh = null;
    /** @type {HTMLElement|null} */
    let soThuTu = null;
    /** @type {HTMLElement|null} */
    let daiNho = null;

    /**
     * @param {number} i
     * @returns {void}
     */
    const hien = (i) => {
        if (!danhSach.length) {
            return;
        }

        viTri = (i + danhSach.length) % danhSach.length;
        anh.src = `${DUONG_DAN}a${danhSach[viTri]}.webp`;
        soThuTu.textContent = `${viTri + 1} / ${danhSach.length}`;

        daiNho.querySelectorAll('.o-nho').forEach((el, n) => {
            el.classList.toggle('dang-xem', n === viTri);
        });

        daiNho.querySelector('.dang-xem')?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        });
    };

    /**
     * @returns {void}
     */
    const dongLai = () => {
        hop.hidden = true;
        document.body.style.removeProperty('overflow');
    };

    /**
     * @param {number} i
     * @returns {void}
     */
    const moRa = (i) => {
        hop.hidden = false;
        document.body.style.overflow = 'hidden';
        hien(i);
    };

    /**
     * Dựng dải ảnh nhỏ phía dưới.
     * @returns {void}
     */
    const dungDaiNho = () => {
        const manh = document.createDocumentFragment();

        danhSach.forEach((ma, n) => {
            const nut = document.createElement('button');
            nut.type = 'button';
            nut.className = 'o-nho';
            nut.setAttribute('aria-label', `Ảnh ${n + 1}`);

            const im = document.createElement('img');
            im.src = `${DUONG_DAN}t${ma}.webp`;
            im.alt = '';
            im.loading = 'lazy';

            nut.appendChild(im);
            nut.addEventListener('click', () => hien(n));
            manh.appendChild(nut);
        });

        daiNho.appendChild(manh);
    };

    /**
     * @returns {void}
     */
    const batVuot = () => {
        let batDau = null;

        hop.addEventListener('touchstart', (e) => {
            batDau = e.changedTouches[0].clientX;
        }, { passive: true });

        hop.addEventListener('touchend', (e) => {
            if (batDau === null) {
                return;
            }

            const doLech = e.changedTouches[0].clientX - batDau;

            if (Math.abs(doLech) > 50) {
                hien(viTri + (doLech < 0 ? 1 : -1));
            }

            batDau = null;
        }, { passive: true });
    };

    /**
     * @returns {void}
     */
    const init = () => {
        const luoi = document.getElementById('luoi-album');
        hop = document.getElementById('xem-album');

        if (!luoi || !hop) {
            return;
        }

        danhSach = (luoi.getAttribute('data-anh') ?? '').split(',').filter(Boolean);

        if (!danhSach.length) {
            return;
        }

        anh = document.getElementById('xem-anh');
        soThuTu = document.getElementById('xem-so');
        daiNho = document.getElementById('xem-dai-nho');

        dungDaiNho();
        batVuot();

        luoi.querySelectorAll('[data-mo]').forEach((el) => {
            el.addEventListener('click', () => moRa(Number(el.getAttribute('data-mo')) || 0));
        });

        document.getElementById('xem-dong').addEventListener('click', dongLai);
        document.getElementById('xem-truoc').addEventListener('click', () => hien(viTri - 1));
        document.getElementById('xem-sau').addEventListener('click', () => hien(viTri + 1));

        // Bấm ra vùng nền tối để đóng
        hop.addEventListener('click', (e) => {
            if (e.target === hop || e.target.id === 'xem-khung') {
                dongLai();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (hop.hidden) {
                return;
            }

            if (e.key === 'Escape') {
                dongLai();
            } else if (e.key === 'ArrowLeft') {
                hien(viTri - 1);
            } else if (e.key === 'ArrowRight') {
                hien(viTri + 1);
            }
        });
    };

    return {
        init,
    };
})();
