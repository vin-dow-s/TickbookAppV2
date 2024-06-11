const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')
require('dotenv').config()

const models = {
    Cabsched: require('./Cabsched')(sequelize, DataTypes),
    Code: require('./Code')(sequelize, DataTypes),
    Component: require('./Component')(sequelize, DataTypes),
    Equiplist: require('./Equiplist')(sequelize, DataTypes),
    Project: require('./Project')(sequelize, DataTypes),
    Revision: require('./Revision')(sequelize, DataTypes),
    Template: require('./Template')(sequelize, DataTypes),
    TickCabBySC: require('./TickCabBySC')(sequelize, DataTypes),
    TickCCHead: require('./TickCCHead')(sequelize, DataTypes),
    TickCCHist: require('./TickCCHist')(sequelize, DataTypes),
    TickEquipList: require('./TickEquipList')(sequelize, DataTypes),
    TickRoot: require('./TickRoot')(sequelize, DataTypes),
}

//Relationship Cabsched <-> Project : Many-To-One
models.Cabsched.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship Cabsched <-> TickCabBySC : One-To-One
models.Cabsched.hasOne(models.TickCabBySC, {
    foreignKey: 'CabNum',
    sourceKey: 'CabNum',
    as: 'tickCabBySC',
})

// Relationship Cabsched <-> Component : Many-To-One
models.Cabsched.belongsTo(models.Component, {
    foreignKey: 'Component_ID',
    targetKey: 'ID',
})

//Relationship Code <-> Component : One-To-Many
models.Code.hasMany(models.Component, {
    foreignKey: 'Code',
    sourceKey: 'Code',
})

//Relationship Component <-> Code : Many-To-One
models.Component.belongsTo(models.Code, {
    foreignKey: 'Code',
    targetKey: 'Code',
})

//Relationship Component <-> Project : Many-To-One
models.Component.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

// Relationship Template <-> Component : Many-To-One
models.Equiplist.belongsTo(models.Component, {
    foreignKey: 'Component_ID',
    targetKey: 'ID',
})

//Relationship Equiplist <-> Template : One-To-Many
models.Equiplist.belongsTo(models.Template, {
    foreignKey: 'Template',
    targetKey: 'Name',
})

//Relationship Equiplist <-> Project : One-To-One
models.Equiplist.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship Equiplist <-> TickEquipList : One-To-Many
models.Equiplist.hasMany(models.TickEquipList, {
    foreignKey: 'EquipRef',
    sourceKey: 'Ref',
})

//Relationship Project <-> Cabsched : One-To-Many
models.Project.hasMany(models.Cabsched, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> Component : One-To-Many
models.Project.hasMany(models.Component, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> Equiplist : One-To-One
models.Project.hasMany(models.Equiplist, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> Revision : One-To-Many
models.Project.hasMany(models.Revision, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> Template : One-To-Many
models.Project.hasMany(models.Template, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> TickCabBySC : One-To-Many
models.Project.hasMany(models.TickCabBySC, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> TickCCHead : One-To-Many
models.Project.hasMany(models.TickCCHead, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> TickCCHist : One-To-Many
models.Project.hasMany(models.TickCCHist, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Project <-> TickEquipList : One-To-Many
models.Project.hasMany(models.TickEquipList, {
    foreignKey: 'JobNo',
    sourceKey: 'JobNo',
})

//Relationship Revision <-> Project : Many-To-One
models.Revision.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship Template <-> Project : Many-To-One
models.Template.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

// Relationship Template <-> Component : Many-To-One
models.Template.belongsTo(models.Component, {
    foreignKey: 'Component_ID',
    targetKey: 'ID',
})

//Relationship Template <-> Equiplist : Many-To-One
models.Template.hasMany(models.Equiplist, {
    foreignKey: 'Template',
    sourceKey: 'Name',
})

//Relationship TickCabBySC <-> Project : Many-To-One
models.TickCabBySC.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship TickCabBySC <-> Cabsched : Many-To-One
models.TickCabBySC.belongsTo(models.Cabsched, {
    foreignKey: 'CabNum',
    targetKey: 'CabNum',
    as: 'cabsched',
})

//Relationship TickCCHead <-> Project : Many-To-One
models.TickCCHead.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship TickCCHead <-> TickCCHist : One-To-Many
models.TickCCHist.belongsTo(models.TickCCHead, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})
models.TickCCHist.belongsTo(models.TickCCHead, {
    foreignKey: 'CcNr',
    targetKey: 'CcNr',
})

//Relationship TickCCHist <-> Project : Many-To-One
models.TickCCHist.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship TickEquipList <-> Project : Many-To-One
models.TickEquipList.belongsTo(models.Project, {
    foreignKey: 'JobNo',
    targetKey: 'JobNo',
})

//Relationship TickEquipList <-> Equiplist : Many-To-One
models.TickEquipList.belongsTo(models.Equiplist, {
    foreignKey: 'EquipRef',
    targetKey: 'Ref',
})

//Synchronisation with the DATABASE. Uncomment to create the database and tables on npm start.
/* sequelize
    .sync()
    .then(() => {
        console.log('Sequelize Sync : Tables successfully created.')
    })
    .catch((error) => {
        console.error(
            'Sequelize Sync : Error while creating the tables :',
            error
        )
    }) */

module.exports = models
