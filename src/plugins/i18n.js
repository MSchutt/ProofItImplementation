// I18n Plugin
import {createI18n} from "vue-i18n";
import en from "../i18n/en.json";

const instance = createI18n({
    locale: 'en',
    messages: { en }
})

export default instance;
export const i18n = instance.global;
