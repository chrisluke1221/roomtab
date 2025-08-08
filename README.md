# Landlord Pro - Bill Automation App

A comprehensive web application for landlords to manage tenants, properties, and automatically calculate bills based on tenant move-in dates.

## 🏠 Features

### **Dashboard**
- Overview statistics (total tenants, properties, monthly revenue, overdue bills)
- Recent bills tracking
- Upcoming move-in notifications
- Quick action buttons for common tasks

### **Tenant Management**
- Add, edit, and delete tenants
- Track move-in dates and lease information
- Monitor days since/until move-in
- Search and filter tenants
- Property assignment and rent amount tracking

### **Property Management**
- Comprehensive property details (address, type, bedrooms, bathrooms, square footage)
- Occupancy rate tracking
- Current tenant information
- Monthly rent configuration

### **Automated Bill Generation**
- **Move-in Date Based Calculation**: Bills are automatically calculated based on tenant move-in dates
- **Bulk Bill Generation**: Generate bills for all eligible tenants for any month/year
- **Multiple Bill Types**: Rent, utilities, late fees, deposits, and other charges
- **Duplicate Prevention**: Smart system prevents duplicate bill generation
- **Payment Tracking**: Mark bills as paid/unpaid with timestamps

### **Bill Management**
- Real-time bill status tracking (paid, unpaid, overdue)
- Search and filter bills by tenant, property, or description
- Manual bill creation and editing
- Payment history and due date monitoring
- Financial statistics and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landlord-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage Guide

### Adding Properties
1. Navigate to the **Properties** page
2. Click **"Add Property"**
3. Fill in property details (address, type, bedrooms, bathrooms, monthly rent)
4. Save the property

### Adding Tenants
1. Go to the **Tenants** page
2. Click **"Add Tenant"**
3. Enter tenant information including:
   - Name, email, phone
   - Property assignment
   - **Move-in date** (critical for bill calculation)
   - Rent amount and deposit
   - Lease end date (optional)
4. Save the tenant

### Generating Bills
1. Navigate to the **Bills** page
2. Click **"Generate Bills"**
3. Select the month and year for bill generation
4. Choose options:
   - Include utilities (with amount)
   - Include late fees for overdue bills
5. Click **"Generate Bills"**

The system will automatically:
- Only generate bills for tenants who have moved in by the selected month
- Create rent bills based on tenant's rent amount
- Add utilities if enabled
- Add late fees for overdue bills if enabled
- Prevent duplicate bills for the same month

### Managing Bills
- **View all bills** in the bills table
- **Search and filter** by status (paid, unpaid, overdue)
- **Mark bills as paid/unpaid** with one click
- **Edit bill details** if needed
- **Delete bills** if necessary

## 💡 Key Features Explained

### Move-in Date Based Billing
The app automatically calculates which tenants should receive bills based on their move-in dates. For example:
- Tenant moves in on March 15, 2024
- Bills will be generated for March 2024 and all subsequent months
- No bills will be generated for January or February 2024

### Smart Bill Generation
- **Eligibility Check**: Only tenants who have moved in by the end of the previous month receive bills
- **Duplicate Prevention**: System checks for existing bills before creating new ones
- **Flexible Options**: Include utilities, late fees, and other charges as needed

### Real-time Tracking
- **Payment Status**: Track paid vs unpaid bills
- **Overdue Alerts**: Highlight overdue bills with red background
- **Financial Summary**: View total amounts, paid amounts, and outstanding balances

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Local Storage** - Data persistence

### Data Structure
```javascript
// Tenant
{
  id: string,
  name: string,
  email: string,
  phone: string,
  propertyId: string,
  moveInDate: string, // ISO date string
  rentAmount: number,
  depositAmount: number,
  leaseEndDate: string, // optional
  notes: string,
  createdAt: string,
  updatedAt: string
}

// Property
{
  id: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  propertyType: string,
  bedrooms: number,
  bathrooms: number,
  squareFeet: number,
  monthlyRent: number,
  notes: string,
  createdAt: string,
  updatedAt: string
}

// Bill
{
  id: string,
  tenantId: string,
  propertyId: string,
  billType: 'rent' | 'utilities' | 'late_fee' | 'deposit' | 'other',
  amount: number,
  dueDate: string, // ISO date string
  description: string,
  paid: boolean,
  paidDate: string | null,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```

## 📊 Dashboard Statistics

The dashboard provides real-time insights:
- **Total Tenants**: Number of registered tenants
- **Properties**: Number of rental properties
- **Monthly Revenue**: Sum of all bills for current month
- **Overdue Bills**: Number of unpaid bills past due date

## 🔧 Customization

### Adding New Bill Types
1. Edit the `billTypes` array in `src/pages/Bills.js`
2. Add your new bill type with appropriate styling

### Modifying Bill Generation Logic
The bill generation logic is in the `handleGenerateBills` function in `src/pages/Bills.js`. You can customize:
- Eligibility criteria
- Bill calculation formulas
- Additional bill types
- Late fee calculations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Build the project
2. Upload the `build` folder to your hosting platform
3. Configure environment variables if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the documentation above
- Review the code comments for implementation details

---

**Landlord Pro** - Making property management simple and automated! 🏠✨