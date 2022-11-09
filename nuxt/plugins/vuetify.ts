import 'vuetify/styles'
import { createVuetify, ThemeDefinition } from 'vuetify'


const blingDark: ThemeDefinition = {
    dark: false,
    colors: {
      background: '#000000',
      surface: '#222222',
      primary: '#BF360C',
      'primary-darken-1': '#870000',
      'primary-lighten-1': '#F9683A',
      secondary: '#6D4C41',
      'secondary-darken-1': '#40241A',
      'secondary-lighten-1': '#9C786C',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    }
  }

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        theme: {
            defaultTheme: 'blingDark',
            themes: {
                blingDark
            }
        }
    })

    nuxtApp.vueApp.use(vuetify)
})