import 'package:flutter/material.dart';
import '../mock_db.dart';
import '../models.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final db = MockDatabase();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF18181B),
      appBar: AppBar(
        title: const Text('Admin Dashboard - Yumto Mandi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF27272A),
        actions: [
          ElevatedButton.icon(
            onPressed: () => _showAddBranchDialog(context),
            icon: const Icon(Icons.add_business, color: Colors.black),
            label: const Text('Add Branch', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFACC15)),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 250,
            color: const Color(0xFF27272A),
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildNavItem(Icons.dashboard, 'Overview', true),
                _buildNavItem(Icons.store, 'Branches', false),
                _buildNavItem(Icons.fastfood, 'Menu Management', false),
                _buildNavItem(Icons.people, 'Staff / Users', false),
                _buildNavItem(Icons.bar_chart, 'Reports', false),
              ],
            ),
          ),
          // Main Content Area
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Branches', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  Expanded(
                    child: ListView.builder(
                      itemCount: db.branches.length,
                      itemBuilder: (context, index) {
                        final branch = db.branches[index];
                        return _buildBranchCard(branch);
                      },
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String title, bool isActive) {
    return Container(
      color: isActive ? const Color(0xFFFACC15).withOpacity(0.1) : Colors.transparent,
      child: ListTile(
        leading: Icon(icon, color: isActive ? const Color(0xFFFACC15) : Colors.white54),
        title: Text(title, style: TextStyle(color: isActive ? const Color(0xFFFACC15) : Colors.white70, fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
        onTap: () {},
      ),
    );
  }

  Widget _buildBranchCard(Branch branch) {
    return Card(
      color: const Color(0xFF27272A),
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFFACC15).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.store, color: Color(0xFFFACC15), size: 40),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(branch.name, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white54, size: 16),
                      const SizedBox(width: 8),
                      Text('\${branch.city} - \${branch.address}', style: const TextStyle(color: Colors.white70)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.phone, color: Colors.white54, size: 16),
                      const SizedBox(width: 8),
                      Text(branch.phone, style: const TextStyle(color: Colors.white70)),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  children: [
                    const Text('Surcharge Active', style: TextStyle(color: Colors.white54)),
                    Switch(
                      value: branch.activeSurchargeToggle,
                      activeColor: const Color(0xFFFACC15),
                      onChanged: (val) {
                        setState(() {
                          // Mutating the mock db directly for UI update
                          // branch.activeSurchargeToggle = val; // Assuming it's not final
                        });
                      },
                    ),
                  ],
                ),
                Text('Booking Fee: PKR \${branch.premiumBookingFee}', style: const TextStyle(color: Color(0xFFFACC15), fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _showAddBranchDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF27272A),
          title: const Text('Add New Branch', style: TextStyle(color: Colors.white)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField('Branch Name', Icons.store),
                const SizedBox(height: 12),
                _buildTextField('City', Icons.location_city),
                const SizedBox(height: 12),
                _buildTextField('Address', Icons.location_on),
                const SizedBox(height: 12),
                _buildTextField('Phone', Icons.phone),
                const SizedBox(height: 12),
                _buildTextField('Premium Booking Fee', Icons.attach_money),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFACC15)),
              onPressed: () {
                // Mock Add logic
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Branch Added Successfully!')));
              },
              child: const Text('Add Branch', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildTextField(String label, IconData icon) {
    return TextField(
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54),
        prefixIcon: Icon(icon, color: Colors.white54),
        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFFACC15))),
      ),
    );
  }
}
