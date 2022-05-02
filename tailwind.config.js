module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,vue}",
    ],
    theme: {
        extend: {
            colors: {
                "light-grey": "#DDDDDD",
                "gray": "#8A8A8A",
            },
        },
    },
    daisyui: {
        themes: [{
            light: {
                "primary": "#B1A7D0",
                "secondary": "#8A8A8A",
                "accent": "#11d8aa",
                "neutral": "#1F282D",
                "base-100": "#F3F3F3",
                "info": "#7D9BE3",
                "success": "#7AB585",
                "warning": "#F6CE55",
                "error": "#f43f5e"
            },
/*            dark: {
                "primary": "#B1A7D0",
                "secondary": "#8A8A8A",
                "accent": "#82e2e5",
                "neutral": "#3D233E",
                "base-100": "#323B57",
                "info": "#6D9DD5",
                "success": "#1B794D",
                "warning": "#9C7502",
                "error": "#EC8379",
                "light-grey": "#DDDDDD",
                "light": "#F3F3F3"
            }*/
        },
        ],
    },
    plugins: [require("daisyui")],
}
