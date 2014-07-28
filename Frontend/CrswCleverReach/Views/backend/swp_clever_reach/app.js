Ext.define('Shopware.apps.SwpCleverReach', {
    extend:'Enlight.app.SubApplication',
    name:'Shopware.apps.SwpCleverReach',
    bulkLoad: true,
    loadPath: '{url action=load}',
    controllers: ['Main'],
    launch: function() {
        var me = this,
            mainController = me.getController('Main');

        return mainController.mainWindow;
    }
});