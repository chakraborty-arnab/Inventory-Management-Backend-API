module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define(
    'product',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        required: true,
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING,
        required: true,
        allowNull: true,
      },
      manufacturer: {
        type: Sequelize.STRING,
        required: true,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        required: true,
        validate:{
          max: 100,                  // only allow values <= 100
          min: 0,                  // only allow values >= 0
        }
      },
      date_added: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      date_last_updated: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      owner_user_id: {
        type: Sequelize.INTEGER,
      }
    },
    {
      updatedAt: 'date_last_updated',
      createdAt: 'date_added',
    }
  );
return Product
}