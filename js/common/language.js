export const lang = (() => {

    const countryMapping = {
        'id': 'ID',
        'en': 'US',
        'fr': 'FR',
        'de': 'DE',
        'es': 'ES',
        'zh': 'CN',
        'ja': 'JP',
        'ko': 'KR',
        'ar': 'SA',
        'ru': 'RU',
        'it': 'IT',
        'nl': 'NL',
        'pt': 'PT',
        'tr': 'TR',
        'th': 'TH',
        'vi': 'VN',
        'ms': 'MY',
        'hi': 'IN',
    };

    /**
     * @type {string|null}
     */
    let country = null;

    /**
     * @type {string|null}
     */
    let locale = null;

    /**
     * @type {string|null}
     */
    let language = null;

    /**
     * @type {Map<string, string>|null}
     */
    let mapping = null;

    return {
        /**
         * @param {string} l 
         * @param {string} val 
         * @returns {this}
         */
        on(l, val) {
            mapping.set(l, val);
            return this;
        },
        /**
         * @returns {string|undefined}
         */
        get() {
            // Thiếu bản dịch cho ngôn ngữ hiện tại thì lấy bản đầu tiên,
            // tránh hiển thị chữ "undefined".
            const tmp = mapping.get(language) ?? mapping.values().next().value;
            mapping.clear();
            return tmp ?? '';
        },
        /**
         * @returns {string|null}
         */
        getCountry() {
            return country;
        },
        /**
         * @returns {string|null}
         */
        getLocale() {
            return locale;
        },
        /**
         * @returns {string|null}
         */
        getLanguage() {
            return language;
        },
        /**
         * @param {string} l 
         * @returns {void}
         */
        setDefault(l) {
            let isFound = true;
            if (!countryMapping[l]) {
                isFound = false;
                console.warn('Language not found, please add manually in countryMapping');
            }

            country = isFound ? countryMapping[l] : 'US';
            language = isFound ? l : 'en';
            locale = `${language}_${country}`;
        },
        /**
         * @returns {void}
         */
        init() {
            mapping = new Map();
            // Thiệp cưới Việt: luôn hiển thị tiếng Việt, không phụ thuộc
            // ngôn ngữ trình duyệt của khách.
            this.setDefault('vi');
        },
    };
})();