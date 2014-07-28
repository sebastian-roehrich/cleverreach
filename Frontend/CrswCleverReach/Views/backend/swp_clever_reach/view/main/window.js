//{namespace name=backend/swp_clever_reach/snippets}
Ext.define('Shopware.apps.SwpCleverReach.view.main.Window', {
    extend: 'Enlight.app.Window',
    id:'SwpCleverReachMainWindow',
    alias: 'widget.swp_clever_reach-main-window',
    iconCls: 'cleverreachicon',
    layout: 'fit',
    width: 860,
    height: '90%',
    //maximized: true,
    autoShow: true,

    snippets: {
        title: '{s name="clever_reach_title"}CleverReach{/s}'
    },

    initComponent: function() {
        var me = this;

        me.title = me.snippets.title;

        this.callParent(arguments);
    },
    
    createTabPanel: function() {
        var me = this;

        me.installForm = Ext.widget('swp_clever_reach-install', {
            configs: me.configs,
            settingsStore: me.settingsStore,
            assignmentsStore: me.assignmentsStore,
            groupsStore: me.groupsStore,
            formsStore: me.formsStore
        });
        me.first_exportForm = Ext.widget('swp_clever_reach-first-export', {
            shopsStore: me.shopsStore
        });

        me.tabpanel = Ext.create('Ext.tab.Panel', {
            items: [
            me.installForm,
            me.first_exportForm
            ]
        });

        me.add(me.tabpanel);
    }
});