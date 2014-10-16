/**
 * @class   Jframe.Base.Url
 * 链接地址设置
 * @singleton
 */
Jframe.define('Jframe.Base.Url', function () {
    'use strict';
    /**
     * @method
     * 获取请求URL前缀
     * @private
     * @param   {string}    path    前缀路径
     * @param   {string}    root    根目录
     *
     * @return  {string}    基于网站根目录的前缀路径
     */
    function getRequestPrefix(path, root) {
        root = root || location.protocol + "//" + location.hostname + ":" + location.port;
        return root + '/' + (path ? path+'/' : '');
    }

    return {
        /**
         * @property    {Object}    prefix
         * URL前缀
         *
         * @property    {string}    prefix.root     根目录
         * @property    {string}    prefix.sem      SEM
         * @property    {string}    prefix.report   报告
         * @property    {string}    prefix.email    email
         * @property    {string}    prefix.nerd     nerd分析
         * @property    {string}    prefix.crabman  crabman分析
         * @property    {string}    prefix.ci       竞争分析
         * @property    {string}    prefix.display  网盟
         */
        prefix: {
            // 根目录
            root: getRequestPrefix(),
            // SEM
            api: getRequestPrefix('api')
        },
        /**
         * @property    {string}    suffix
         * URL后缀
         */
        suffix: '.json'
    };
});