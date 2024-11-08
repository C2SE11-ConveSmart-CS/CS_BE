const Customer = require('../models/customer');
const moment = require('moment');

class CustomerService {

  async getAllCustomers(search, page = 1, limit = 10) {
    const isDate = moment(search, 'YYYY-MM-DD', true).isValid();
    const isYear = moment(search, 'YYYY', true).isValid();
    const isMonth = moment(search, 'YYYY-MM', true).isValid();
  
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { createdBy: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            ...(isDate
              ? [
                  {
                    lastContactDate: {
                      $gte: moment(search).startOf('day').toDate(),
                      $lt: moment(search).endOf('day').toDate(),
                    },
                  },
                ]
              : []),
            ...(isYear
              ? [
                  {
                    lastContactDate: {
                      $gte: moment(search).startOf('year').toDate(),
                      $lt: moment(search).endOf('year').toDate(),
                    },
                  },
                ]
              : []),
            ...(isMonth
              ? [
                  {
                    lastContactDate: {
                      $gte: moment(search).startOf('month').toDate(),
                      $lt: moment(search).endOf('month').toDate(),
                    },
                  },
                ]
              : []),
          ],
        }
      : {};
  
    const skip = (page - 1) * limit;
    const customers = await Customer.find(query)
      .skip(skip)
      .limit(limit);
  
    const total = await Customer.countDocuments(query);
  
    return {
      customers,
      total,
    };
  }
  
  async getCustomerById(id) {
    return await Customer.findOne({ id });
  }

  async createCustomer(data) {
    const customer = new Customer(data);
    return await customer.save();
  }

  async updateCustomer(id, data) {
    return await Customer.findOneAndUpdate(
      { id }, 
      data, 
      { new: true }
    );
  }

  async deleteCustomer(id) {
    return await Customer.findOneAndDelete({ id });
  }
}

module.exports = new CustomerService();
