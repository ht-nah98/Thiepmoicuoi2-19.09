/**
 * Tải thư viện phụ (AOS, confetti) từ chính máy chủ của thiệp.
 *
 * Trước đây tải từ cdn.jsdelivr.net — CDN này hay bị chặn hoặc chập chờn
 * trên mạng di động Việt Nam, khiến khách không mở được thiệp.
 */

const duongDan = {
    aosCss: './assets/libs/aos.css',
    aosJs: './assets/libs/aos.js',
    confetti: './assets/libs/confetti.js',
};

/**
 * @param {string} src
 * @returns {Promise<void>}
 */
const napJs = (src) => new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.onload = res;
    sc.onerror = () => rej(new Error(`Không tải được ${src}`));
    sc.src = src;
    document.head.appendChild(sc);
});

/**
 * @param {string} href
 * @returns {Promise<void>}
 */
const napCss = (href) => new Promise((res, rej) => {
    const link = document.createElement('link');
    link.onload = res;
    link.onerror = () => rej(new Error(`Không tải được ${href}`));
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
});

/**
 * @returns {Promise<void>}
 */
const napAos = () => Promise.all([
    napCss(duongDan.aosCss),
    napJs(duongDan.aosJs),
]).then(() => {
    if (typeof window.AOS !== 'undefined') {
        window.AOS.init();
    }
});

/**
 * Tải các thư viện phụ. Chúng chỉ phục vụ hiệu ứng, nên nếu tải hỏng
 * thì thiệp vẫn mở bình thường — không chặn khách xem.
 *
 * @param {Object} [opt]
 * @param {boolean} [opt.aos=true]
 * @param {boolean} [opt.confetti=true]
 * @returns {Promise<void>}
 */
export const loader = (opt = {}) => {
    const viec = [];

    if (opt?.aos ?? true) {
        viec.push(napAos().catch((e) => console.warn('[libs] AOS:', e.message)));
    }

    if (opt?.confetti ?? true) {
        viec.push(napJs(duongDan.confetti).catch((e) => console.warn('[libs] confetti:', e.message)));
    }

    return Promise.all(viec).then(() => undefined);
};
