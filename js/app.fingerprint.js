/**
 * Fingerprint Component v2.1 (Stable)
 * A robust class for collecting browser and system information without any UI logic.
 * This class is designed to be instantiated and its methods called to retrieve data.
 */
class Fingerprint {
    constructor() {
        // This class is now purely for data gathering. No DOM elements are needed.
    }

    getBrowserInfo() {
        const ua = navigator.userAgent.toLowerCase();
        let browser, version, os;

        if (ua.includes('windows nt 10.0')) os = 'Windows 10/11';
        else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
        else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
        else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
        else if (ua.includes('windows')) os = 'Windows (Older)';
        else if (ua.includes('mac os x')) os = 'macOS';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('linux')) os = 'Linux';
        else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'iOS';
        else os = 'Unknown OS';

        if (ua.includes('edg/')) {
            browser = 'Microsoft Edge';
            version = ua.match(/edg\/([\d.]+)/)?.[1];
        } else if (ua.includes('firefox/')) {
            browser = 'Firefox';
            version = ua.match(/firefox\/([\d.]+)/)?.[1];
        } else if (ua.includes('chrome/')) {
            browser = 'Chrome';
            version = ua.match(/chrome\/([\d.]+)/)?.[1];
        } else if (ua.includes('safari/')) {
            browser = 'Safari';
            version = ua.match(/version\/([\d.]+)/)?.[1];
        } else {
            browser = 'Unknown Browser';
            version = 'N/A';
        }

        return { browser, version, os };
    }

    getBrowserEngine() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('webkit')) return ua.includes('chrome') ? 'Blink' : 'WebKit';
        if (ua.includes('gecko')) return 'Gecko';
        if (ua.includes('trident')) return 'Trident';
        return 'Unknown';
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
        return 'Desktop';
    }
    
    getArchitecture() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('x86_64') || ua.includes('x64') || ua.includes('win64')) return 'x86_64';
        if (ua.includes('arm64') || ua.includes('aarch64')) return 'ARM64';
        if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) return 'ARM (Apple Silicon)';
        if (ua.includes('x86') || ua.includes('i686') || ua.includes('win32')) return 'x86';
        if (ua.includes('arm')) return 'ARM32';
        return 'Unknown';
    }

    getApproximateMemory() {
        return navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not Reported';
    }

    getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return { vendor: 'N/A', renderer: 'N/A' };
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return {
                vendor: gl.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || gl.VENDOR) || 'Unknown',
                renderer: gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || gl.RENDERER) || 'Unknown'
            };
        } catch (e) {
            return { vendor: 'Error', renderer: 'Error accessing WebGL' };
        }
    }

    isIncognitoMode() {
        try {
            localStorage.setItem('__test__', '1');
            localStorage.removeItem('__test__');
            return false;
        } catch (e) {
            return true;
        }
    }

    getDNTStatus() {
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        if (dnt === '1') return 'Enabled';
        if (dnt === '0') return 'Disabled';
        return 'Not Specified';
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const txt = 'Mr.SAM-Terminal-v1.0';
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText(txt, 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText(txt, 4, 17);
            const dataUrl = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < dataUrl.length; i++) {
                hash = ((hash << 5) - hash) + dataUrl.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        } catch (e) {
            return 'not_supported';
        }
    }

    getDetailedTimezoneInfo() {
        const offset = new Date().getTimezoneOffset();
        const sign = offset < 0 ? '+' : '-';
        const hours = Math.abs(Math.floor(offset / 60)).toString().padStart(2, '0');
        const minutes = Math.abs(offset % 60).toString().padStart(2, '0');
        return {
            'Timezone Name': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'Timezone Offset': `UTC${sign}${hours}:${minutes}`
        };
    }

    analyzeUserAgentSuspicion() {
        const ua = navigator.userAgent.toLowerCase();
        let score = 0;
        let reasons = [];

        const botPatterns = ['bot', 'crawler', 'spider', 'headless', 'puppeteer', 'phantomjs', 'selenium', 'webdriver'];
        for (const pattern of botPatterns) {
            if (ua.includes(pattern)) {
                score += 50;
                reasons.push(`Bot signature detected: '${pattern}'`);
                break;
            }
        }

        if (navigator.plugins.length === 0 && this.getDeviceType() === 'Desktop') {
            score += 15;
            reasons.push('No plugins detected (common in automated browsers)');
        }

        if (!navigator.language) {
            score += 10;
            reasons.push('Browser language is not specified');
        }

        const level = score >= 50 ? 'High' : score >= 15 ? 'Medium' : score > 0 ? 'Low' : 'None';
        return { score, level, reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected.'] };
    }

    generateHashedFingerprint() {
        const components = [
            navigator.userAgent,
            this.getCanvasFingerprint(),
            (navigator.languages || []).join(','),
            `${screen.width}x${screen.height}x${screen.colorDepth}`,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency,
            navigator.platform,
            this.getGPUInfo().renderer
        ];
        const combined = components.join('|||');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `sam-${Math.abs(hash).toString(16).toUpperCase()}`;
    }
}
