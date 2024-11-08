const customerService = require('../services/customer.service');

class CustomerController {
  async getAll(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const result = await customerService.getAllCustomers(search, parseInt(page), parseInt(limit));
      res.status(200).json({
        customers: result.customers,
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      console.log('réaaq', req)
      const newCustomer = await customerService.createCustomer(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
      if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deletedCustomer = await customerService.deleteCustomer(req.params.id);
      if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found' });
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CustomerController();
