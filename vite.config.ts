import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// polyfill https://github.com/vitejs/vite/tree/main/packages/plugin-legacy
import legacy from '@vitejs/plugin-legacy'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import visualizer from 'rollup-plugin-visualizer'

function pathResolve(...args) {
  return resolve(__dirname, '.', ...args)
}

// https://vitejs.dev/config/
export default defineConfig(params => {
  const { command, mode } = params
  const ENV = loadEnv(mode, process.cwd())
  console.info(`running mode: ${mode}, command: ${command}, ENV: ${JSON.stringify(ENV)}`)

  return {
    plugins: getPlugins(),
    base: './',
    resolve: {
      extensions: ['.json', '.js', '.jsx', '.ts', 'tsx', '.vue'],
      alias: {
        '@': pathResolve('src'),
        '#': pathResolve('types'),
      }
    },
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // https://vitejs.dev/config/#server-options
    server: {
      // Tauri expects a fixed port, fail if that port is not available
      strictPort: true,
      host: '0.0.0.0',
      port: 5173,
      // strictPort: false,
      // https: false,
      // open: '/',
      disableHostCheck: true, // 解决127.0.0.1指向其他域名时出现"Invalid Host header"问题
      // https://vitejs.dev/config/#server-proxy
      proxy: {
        '^\/(gateway)': {
          target: 'https://xxx.com', // alpha
          headers: {
            host: 'xxx.com'
          },
          changOrigin: true, // 配置跨域
          //ws: true, // 配置ws跨域
          secure: false, // https协议才设置
          //loglevel: 'debug',
          //rewrite: path => path.replace(/^\/api/, ''),
        }
      },
    },
    // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
    // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
    // env variables
    envPrefix: ['VITE_', 'TAURI_'],
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          // additionalData: `$injectedColor: orange;`
          additionalData: '@import "@/assets/stylesheets/globalInjectedData.scss";'
        },
        less: {
          // modifyVars: {
          //   '@primary-color': '#1990EB',
          // },
          // javascriptEnabled: true,
        }
      },
      // please config in postcss.config.js
      // postcss: {
      //   plugins: []
      // }
    },
    build: {
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
      rollupOptions: {
        output:{
          manualChunks: {
            // 'lodash-es': ['lodash-es'],
          }
        }
      }
    }
  }
})

function getPlugins(): any[] {
  const plugins = [
    vue(),
    vueJsx(),
    legacy({
      targets: ['defaults'/*, 'not IE 11'*/, 'ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    AutoImport({
      dts: 'types/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: 'types/components.d.ts',
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }),
  ]

  if (process.env.FOR_ANALYTICS) {
    plugins.push(visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }))
  }

  return plugins
}
