Ext.define('Shopware.apps.SwpCleverReach.model.Group', {
    extend: 'Ext.data.Model',
    fields: [
            { name: 'id', type: 'int' },
            { name: 'name',  type: 'string' }

    ],
    proxy: {
        type: 'ajax',
        url : '{url action=getGroups}',
        reader: {
            type: 'json',
            root: 'data'
        }
    },

    associations: [{
        type: 'hasMany',
        model: 'Shopware.apps.SwpCleverReach.model.Form',
        name: 'getForms',
        associationKey: 'forms'
    }]
});