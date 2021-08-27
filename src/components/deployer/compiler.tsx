import { useWorker, WORKER_STATUS } from "@koale/useworker";

const solcjsCore = require('solcjs-core');
const solcjsVersion = require('solc-version');
const ajaxCaching = require('ajax-caching');
const promiseAjax = ajaxCaching.promiseAjax;

export const compileTask = async (source: string) => {

    const solcjsCore = require('solcjs-core');
    const solcjsVersion = require('solc-version');
    const ajaxCaching = require('ajax-caching');
    const promiseAjax = ajaxCaching.promiseAjax;

    console.log(solcjsCore);
    async function getCompilersource(compilerURL: string) {
        try {
            const opts = {
                url: compilerURL,
                caching: true,
                transform: function (data: string) {
                    if (data.substring(0, 10) != 'var Module') {
                        throw Error('get compiler source fail');
                    }
                    return data;
                }
            };
            return await promiseAjax(opts);
        } catch (error) {
            throw error;
        }
    }

    // wget https://ethereum.github.io/solc-bin/bin/soljson-v0.6.12+commit.27d51765.js

    let versions = await solcjsVersion.versions()
    console.log(versions);
    // console.log((window as any).loadModule);
    const compilersource = await getCompilersource(`${window.location.origin}/solc-bin/soljson-v0.6.12+commit.27d51765.js`);

    // let solc = (window as any).loadModule(compilersource);

    // console.log(solc);

    console.log('-inworker')

    return true;
}