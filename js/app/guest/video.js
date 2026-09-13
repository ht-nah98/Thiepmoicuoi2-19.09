import { progress } from './progress.js';
import { util } from '../../common/util.js';
import { cache } from '../../connection/cache.js';
import { HTTP_GET, request, HTTP_STATUS_OK, HTTP_STATUS_PARTIAL_CONTENT } from '../../connection/request.js';

export const video = (() => {

    /**
     * @type {ReturnType<typeof cache>|null}
     */
    let c = null;

    /**
     * @returns {Promise<void>}
     */
    const load = () => {
        const wrap = document.getElementById('video-love-stroy');
        if (!wrap || !wrap.hasAttribute('data-src')) {
            wrap?.remove();
            progress.complete('video', true);
            return Promise.resolve();
        }

        const src = wrap.getAttribute('data-src');
        if (!src) {
            progress.complete('video', true);
            return Promise.resolve();
        }

        const vid = document.createElement('video');
        vid.className = wrap.getAttribute('data-vid-class');
        vid.loop = true;
        vid.muted = false;
        vid.controls = true;
        vid.autoplay = false;
        vid.playsInline = true;
        vid.preload = 'metadata';
        vid.disableRemotePlayback = true;
        vid.disablePictureInPicture = true;
        vid.controlsList = 'noremoteplayback nodownload noplaybackrate';

        // Video chỉ dừng khi cuộn ra khỏi màn hình, KHÔNG tự phát khi cuộn tới.
        // Khách phải chủ động bấm nút play mới xem.
        const observer = new IntersectionObserver((es) => es.forEach((e) => {
            if (!e.isIntersecting) {
                vid.pause();
            }
        }));

        /**
         * Nhạc nền và tiếng video không chồng lên nhau.
         * @returns {HTMLElement|null}
         */
        const nutNhac = () => {
            const n = document.getElementById('button-music');
            return (n && !n.classList.contains('d-none')) ? n : null;
        };

        /**
         * @returns {boolean}
         */
        const nhacDangPhat = () => {
            const n = nutNhac();
            return n !== null && n.querySelector('.fa-circle-play') === null;
        };

        let tuTatNhac = false;

        // Khách bấm play -> bật tiếng video + tắt nhạc nền
        vid.addEventListener('play', () => {
            if (vid.muted) {
                vid.muted = false;
            }

            if (nhacDangPhat()) {
                nutNhac().click();
                tuTatNhac = true;
            }
        });

        // Video dừng (bấm pause hoặc cuộn đi) -> trả lại nhạc nền
        vid.addEventListener('pause', () => {
            if (tuTatNhac && !nhacDangPhat()) {
                nutNhac()?.click();
                tuTatNhac = false;
            }
        });

        // Khách tự tắt/bật tiếng video bằng nút loa
        vid.addEventListener('volumechange', () => {
            const coTieng = !vid.muted && vid.volume > 0;

            if (coTieng && nhacDangPhat()) {
                nutNhac().click();
                tuTatNhac = true;
            } else if (!coTieng && tuTatNhac && !nhacDangPhat()) {
                nutNhac()?.click();
                tuTatNhac = false;
            }
        });

        /**
         * @param {Response} res 
         * @returns {Promise<Response>}
         */
        const resToVideo = (res) => {
            vid.addEventListener('loadedmetadata', () => {
                vid.style.removeProperty('height');
                document.getElementById('video-love-stroy-loading')?.remove();
            }, { once: true });

            return res.clone().blob().then((b) => {
                vid.src = URL.createObjectURL(b);
                return res;
            });
        };

        /**
         * @returns {Promise<Response>}
         */
        const fetchBasic = () => {
            const bar = document.getElementById('progress-bar-video-love-stroy');
            const inf = document.getElementById('progress-info-video-love-stroy');

            return request(HTTP_GET, src)
                .withCancel(new Promise((re) => vid.addEventListener('undangan.video.prefetch', re, { once: true })))
                .default({ 'Range': 'bytes=0-1' })
                .then((res) => {
                    vid.dispatchEvent(new Event('undangan.video.prefetch'));

                    if (res.status === HTTP_STATUS_OK) {
                        vid.preload = 'none';

                        vid.src = util.escapeHtml(src);
                        wrap.appendChild(vid);

                        return Promise.resolve();
                    }

                    if (res.status !== HTTP_STATUS_PARTIAL_CONTENT) {
                        throw new Error('failed to fetch video');
                    }

                    vid.addEventListener('error', () => progress.invalid('video'), { once: true });

                    // Chờ metadata, nhưng không chờ mãi: nếu sau 8 giây vẫn chưa có
                    // (mạng chậm, CDN chặn tạm thời) thì vẫn cho tiến trình đi tiếp —
                    // video sẽ tự tải khi khách bấm xem.
                    const loaded = Promise.race([
                        new Promise((r) => vid.addEventListener('loadedmetadata', r, { once: true })),
                        new Promise((r) => util.timeOut(r, 8000)),
                    ]);

                    vid.src = util.escapeHtml(src);
                    wrap.appendChild(vid);

                    return loaded;
                })
                .then(() => {
                    progress.complete('video');

                    const height = vid.getBoundingClientRect().width * (vid.videoHeight / vid.videoWidth);
                    vid.style.height = `${height}px`;

                    return request(HTTP_GET, vid.src)
                        .withProgressFunc((a, b) => {
                            const result = Number((a / b) * 100).toFixed(0) + '%';

                            bar.style.width = result;
                            inf.innerText = result;
                        })
                        .withRetry()
                        .default()
                        .then(resToVideo)
                        .catch((err) => {
                            bar.style.backgroundColor = 'red';
                            inf.innerText = `Error loading video`;
                            console.error(err);
                        })
                        .finally(() => observer.observe(vid));
                });
        };

        if (!window.isSecureContext) {
            return fetchBasic();
        }

        return c.has(src).then((res) => {
            if (!res) {
                return c.del(src).then(fetchBasic).then((r) => c.set(src, r));
            }

            progress.complete('video');
            return resToVideo(res).finally(() => {
                wrap.appendChild(vid);
                observer.observe(vid);
            });
        });
    };

    /**
     * @returns {object}
     */
    const init = () => {
        progress.add();
        c = cache('video').withForceCache();

        return {
            load,
        };
    };

    return {
        init,
    };
})();