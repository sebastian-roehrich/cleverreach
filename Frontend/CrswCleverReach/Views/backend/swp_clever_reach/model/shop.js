Ext.define('Shopware.apps.SwpCleverReach.model.Shop', {
    extend: 'Ext.data.Model',
    fields: [
            { name: 'id', type: 'int' },
            { name: 'name',  type: 'string' },
            { name: 'active',  type: 'boolean' },
            { name: 'export_limit',  type: 'int' }
    ],
    proxy: {
        type: 'ajax',
        url : '{url action=getShops}',
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});