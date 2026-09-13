const zIndex = 1057;

/**
 * Tông màu champagne của thiệp, thay cho hồng chói mặc định.
 */
const mauTim = ['#d4b158', '#e8cc8a', '#c2a04a', '#f0dcae'];

/**
 * @returns {any}
 */
const hinhTraiTim = () => {
    return window.confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
    });
};

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const ngauNhien = (min, max) => Math.random() * (max - min) + min;

/**
 * Mưa trái tim nhẹ nhàng, thưa dần rồi tắt.
 * @param {number} [until=26]
 * @returns {void}
 */
export const openAnimation = (until = 26) => {
    if (!window.confetti) {
        return;
    }

    const thoiLuong = until * 1000;
    const ketThuc = Date.now() + thoiLuong;
    const tim = hinhTraiTim();

    let lanCuoi = 0;

    const khung = () => {
        const conLai = ketThuc - Date.now();
        const bayGio = Date.now();

        // Thả tim cách nhau ~220ms cho thưa, không dày đặc như pháo giấy
        if (bayGio - lanCuoi > 220) {
            lanCuoi = bayGio;

            // Bông to bông nhỏ xen kẽ: đa số vừa, thỉnh thoảng một bông to
            const laBongTo = Math.random() < 0.25;
            const coBong = laBongTo ? ngauNhien(1.25, 1.5) : ngauNhien(0.65, 1.1);

            window.confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: 420,
                // Bông to rơi chậm hơn cho tự nhiên
                gravity: laBongTo ? ngauNhien(0.18, 0.28) : ngauNhien(0.24, 0.42),
                decay: 0.97,
                scalar: coBong,
                drift: ngauNhien(-0.5, 0.5),
                shapes: [tim],
                colors: mauTim,
                origin: { x: Math.random(), y: -0.05 },
                zIndex: zIndex,
            });
        }

        if (conLai > 0) {
            requestAnimationFrame(khung);
        }
    };

    requestAnimationFrame(khung);
};

/**
 * Trái tim bung ra khi khách bấm mở phần câu chuyện.
 * @param {HTMLElement} div
 * @param {number} [duration=50]
 * @returns {void}
 */
export const tapTapAnimation = (div, duration = 50) => {
    if (!window.confetti) {
        return;
    }

    const khung = div.getBoundingClientRect();
    const y = Math.max(0.3, Math.min(1, (khung.top / window.innerHeight) + 0.2));
    const tim = hinhTraiTim();

    const chung = {
        particleCount: 6,
        spread: 50,
        startVelocity: 22,
        ticks: 160,
        gravity: 0.5,
        decay: 0.93,
        scalar: 0.85,
        shapes: [tim],
        colors: mauTim,
        zIndex: zIndex,
    };

    window.confetti({
        ...chung,
        angle: 60,
        origin: { x: khung.left / window.innerWidth, y: y },
    });

    window.confetti({
        ...chung,
        angle: 120,
        origin: { x: khung.right / window.innerWidth, y: y },
    });
};
