document.addEventListener('DOMContentLoaded', () => {
    const baseColorPicker = document.getElementById('baseColorPicker');
    const baseColorSwatch = document.getElementById('baseColorSwatch');
    const baseHexSpan = document.getElementById('baseHex');
    const baseRgbSpan = document.getElementById('baseRgb');
    const baseHslSpan = document.getElementById('baseHsl');

    const monochromaticPalette = document.getElementById('monochromaticPalette');
    const analogousPalette = document.getElementById('analogousPalette');
    const complementaryPalette = document.getElementById('complementaryPalette');
    const triadicPalette = document.getElementById('triadicPalette');
    const tetradicPalette = document.getElementById('tetradicPalette');

    // Utility functions for color conversion

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue (0-1)
     * @param   Number  s       The saturation (0-1)
     * @param   Number  l       The lightness (0-1)
     * @return  Array           The RGB representation [r, g, b]
     */
    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255),
        ];
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   Number  r       The red color value (0-255)
     * @param   Number  g       The green color value (0-255)
     * @param   Number  b       The blue color value (0-255)
     * @return  Array           The HSL representation [h, s, l]
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    /**
     * Converts an RGB color value to Hexadecimal.
     * @param   Number  r       The red color value (0-255)
     * @param   Number  g       The green color value (0-255)
     * @param   Number  b       The blue color value (0-255)
     * @return  String          The Hexadecimal representation (e.g., '#RRGGBB')
     */
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    /**
     * Converts a Hexadecimal color value to RGB.
     * @param   String  hex     The Hexadecimal color value (e.g., '#RRGGBB')
     * @return  Object          An object with r, g, b properties (0-255)
     */
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    /**
     * Calculates the perceived luminance of an RGB color.
     * Used to determine whether to use light or dark text on a color swatch.
     * @param   Number  r       Red component (0-255)
     * @param   Number  g       Green component (0-255)
     * @param   Number  b       Blue component (0-255)
     * @return  Number          Luminance value (0-1)
     */
    function getLuminance(r, g, b) {
        // Normalize RGB values to 0-1
        const [nr, ng, nb] = [r, g, b].map(c => c / 255);
        // Apply sRGB transformation
        const [sr, sg, sb] = [nr, ng, nb].map(c =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        );
        return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
    }

    /**
     * Determines if text should be light or dark based on background color luminance.
     * @param   Number  r       Red component (0-255)
     * @param   Number  g       Green component (0-255)
     * @param   Number  b       Blue component (0-255)
     * @return  String          'text-light' or 'text-dark' CSS class
     */
    function getContrastTextColorClass(r, g, b) {
        const luminance = getLuminance(r, g, b);
        // A common threshold for light/dark text is 0.179 for perceived luminance (WCAG recommendation is 0.179 for a 4.5:1 contrast ratio with white/black text)
        return luminance > 0.179 ? 'text-dark' : 'text-light';
    }

    /**
     * Clamps a value between a min and max.
     * @param   Number  value   The value to clamp
     * @param   Number  min     The minimum value
     * @param   Number  max     The maximum value
     * @return  Number          The clamped value
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * Adjusts hue to be within 0-360 degrees.
     * @param   Number  h       Hue value in degrees
     * @return  Number          Adjusted hue in degrees
     */
    function adjustHue(h) {
        while (h < 0) h += 360;
        while (h >= 360) h -= 360;
        return h;
    }

    /**
     * Creates and appends a color swatch element to a palette.
     * @param   HTMLElement parentElement  The DOM element to append the swatch to.
     * @param   String      hexColor       The hexadecimal color string (e.g., '#RRGGBB').
     * @param   Object      rgbColor       An object {r, g, b}.
     * @param   Array       hslColor       An array [h, s, l] where h,s,l are in [0,1].
     */
    function createColorSwatch(parentElement, hexColor, rgbColor, hslColor) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hexColor;

        const textColorClass = getContrastTextColorClass(rgbColor.r, rgbColor.g, rgbColor.b);
        swatch.classList.add(textColorClass);

        const hexP = document.createElement('p');
        hexP.textContent = `HEX: ${hexColor}`;
        swatch.appendChild(hexP);

        const rgbP = document.createElement('p');
        rgbP.textContent = `RGB: ${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`;
        swatch.appendChild(rgbP);

        // Convert HSL for display: Hue to degrees (0-360), Saturation/Lightness to percentage (0-100)
        const hslP = document.createElement('p');
        hslP.textContent = `HSL: ${Math.round(hslColor[0] * 360)}°, ${Math.round(hslColor[1] * 100)}%, ${Math.round(hslColor[2] * 100)}%`;
        swatch.appendChild(hslP);

        parentElement.appendChild(swatch);
    }

    // Main function to update all colors and schemes
    function updateColors(hex) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Display base color info
        baseColorSwatch.style.backgroundColor = hex;
        baseHexSpan.textContent = hex;
        baseRgbSpan.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        baseHslSpan.textContent = `${Math.round(hsl[0] * 360)}°, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%`;

        // Update base swatch text contrast class
        const textColorClass = getContrastTextColorClass(rgb.r, rgb.g, rgb.b);
        baseColorSwatch.classList.remove('text-light', 'text-dark'); // Clear existing
        baseColorSwatch.classList.add(textColorClass);

        // Clear previous palettes
        monochromaticPalette.innerHTML = '';
        analogousPalette.innerHTML = '';
        complementaryPalette.innerHTML = '';
        triadicPalette.innerHTML = '';
        tetradicPalette.innerHTML = '';

        // Generate and display schemes
        generateMonochromatic(hsl);
        generateAnalogous(hsl);
        generateComplementary(hsl);
        generateTriadic(hsl);
        generateTetradic(hsl);
    }

    function generateMonochromatic([h, s, l]) {
        // Base color
        createColorSwatch(monochromaticPalette, baseColorPicker.value, hexToRgb(baseColorPicker.value), [h, s, l]);

        // Variations in lightness and saturation
        const variations = [
            [h, clamp(s * 0.7, 0, 1), clamp(l * 0.8, 0, 1)], // Darker, less saturated
            [h, clamp(s * 0.9, 0, 1), clamp(l * 0.9, 0, 1)], // Slightly darker, less saturated
            [h, clamp(s * 1.1, 0, 1), clamp(l * 1.1, 0, 1)], // Slightly brighter, more saturated
            [h, clamp(s * 1.3, 0, 1), clamp(l * 1.2, 0, 1)]  // Brighter, more saturated
        ];

        variations.forEach(([nh, ns, nl]) => {
            const [r, g, b] = hslToRgb(nh, ns, nl);
            const hex = rgbToHex(r, g, b);
            createColorSwatch(monochromaticPalette, hex, { r, g, b }, [nh, ns, nl]);
        });
    }

    function generateAnalogous([h, s, l]) {
        // Degrees for analogous colors relative to base hue
        const degrees = [-60, -30, 0, 30, 60]; // 0 is base color

        degrees.forEach(deg => {
            // Convert h from [0,1] to [0,360], add degree offset, then convert back to [0,1]
            const newHue = adjustHue(h * 360 + deg) / 360;
            const [r, g, b] = hslToRgb(newHue, s, l);
            const hex = rgbToHex(r, g, b);
            createColorSwatch(analogousPalette, hex, { r, g, b }, [newHue, s, l]);
        });
    }

    function generateComplementary([h, s, l]) {
        // Base color
        createColorSwatch(complementaryPalette, baseColorPicker.value, hexToRgb(baseColorPicker.value), [h, s, l]);

        // Complementary hue (180 degrees opposite)
        const compHue = adjustHue(h * 360 + 180) / 360;
        const [rComp, gComp, bComp] = hslToRgb(compHue, s, l);
        const hexComp = rgbToHex(rComp, gComp, bComp);
        createColorSwatch(complementaryPalette, hexComp, { r: rComp, g: gComp, b: bComp }, [compHue, s, l]);

        // Add some variations around the complementary color
        const variations = [
            [compHue, clamp(s * 0.8, 0, 1), clamp(l * 0.7, 0, 1)], // Darker, less saturated
            [compHue, clamp(s * 1.2, 0, 1), clamp(l * 1.1, 0, 1)]  // Brighter, more saturated
        ];
        variations.forEach(([nh, ns, nl]) => {
            const [r, g, b] = hslToRgb(nh, ns, nl);
            const hex = rgbToHex(r, g, b);
            createColorSwatch(complementaryPalette, hex, { r, g, b }, [nh, ns, nl]);
        });
    }

    function generateTriadic([h, s, l]) {
        const hues = [
            h,
            adjustHue(h * 360 + 120) / 360,
            adjustHue(h * 360 + 240) / 360
        ];

        hues.forEach(newHue => {
            const [r, g, b] = hslToRgb(newHue, s, l);
            const hex = rgbToHex(r, g, b);
            createColorSwatch(triadicPalette, hex, { r, g, b }, [newHue, s, l]);
        });

        // Add some lighter/darker variations for a richer palette
        hues.forEach(newHue => {
            const [r1, g1, b1] = hslToRgb(newHue, clamp(s * 0.8, 0, 1), clamp(l * 0.7, 0, 1));
            createColorSwatch(triadicPalette, rgbToHex(r1, g1, b1), { r: r1, g: g1, b: b1 }, [newHue, clamp(s * 0.8, 0, 1), clamp(l * 0.7, 0, 1)]);

            const [r2, g2, b2] = hslToRgb(newHue, clamp(s * 1.1, 0, 1), clamp(l * 1.1,
