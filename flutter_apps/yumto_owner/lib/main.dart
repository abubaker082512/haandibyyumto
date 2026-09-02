import 'package:flutter/material.dart';
import 'package:yumto_core/yumto_core.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const YumtoOwnerApp());
}

class YumtoOwnerApp extends StatelessWidget {
  const YumtoOwnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haandi - Owner',
      theme: YumtoTheme.lightTheme,
      home: const SplashScreen(
        nextScreen: HaandiLoginScreen(
          portalTitle: 'Haandi Owner Executive',
          portalSubtitle: 'Global Business Analytics & Outlets',
          allowedRoles: ['OWNER'],
          nextScreen: AdminScreen(),
        ),
      ),
    );
  }
}

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
      appBar: AppBar(
        title: const Text('Haandi Owner Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
            tooltip: 'Sign Out',
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(
                  builder: (_) => const HaandiLoginScreen(
                    portalTitle: 'Haandi Owner Executive',
                    portalSubtitle: 'Global Business Analytics & Outlets',
                    allowedRoles: ['OWNER'],
                    nextScreen: AdminScreen(),
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 250,
            color: Colors.grey[100],
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
                  const Text('Chain Branches', style: TextStyle(color: Colors.black87, fontSize: 28, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
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
    return Material(
      color: isActive ? const Color(0xFFE85D04).withValues(alpha: 0.15) : Colors.transparent,
      child: ListTile(
        leading: Icon(icon, color: isActive ? const Color(0xFF8B1E1E) : Colors.black54),
        title: Text(
          title,
          style: TextStyle(
            color: isActive ? const Color(0xFF8B1E1E) : Colors.black87,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        onTap: () {},
      ),
    );
  }

  Widget _buildBranchCard(Branch branch) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFE85D04).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.store, color: Color(0xFF8B1E1E), size: 40),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(branch.name, style: const TextStyle(color: Colors.black87, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.black54, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${branch.city} - ${branch.address}',
                          style: const TextStyle(color: Colors.black54),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.phone, color: Colors.black54, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          branch.phone,
                          style: const TextStyle(color: Colors.black54),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
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
                    const Text('Surcharge Active', style: TextStyle(color: Colors.black54)),
                    Switch(
                      value: branch.activeSurchargeToggle,
                      activeColor: const Color(0xFF8B1E1E),
                      onChanged: (val) {
                        setState(() {
                          // Mutating the mock db directly for UI update
                        });
                      },
                    ),
                  ],
                ),
                Text('Booking Fee: PKR ${branch.premiumBookingFee}', style: const TextStyle(color: Color(0xFFEAB308), fontWeight: FontWeight.bold)),
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
          backgroundColor: Colors.white,
          title: const Text('Add New Branch', style: TextStyle(color: Colors.black87)),
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
              child: const Text('Cancel', style: TextStyle(color: Colors.black54)),
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
      style: const TextStyle(color: Colors.black87),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.black54),
        prefixIcon: Icon(icon, color: Colors.black54),
        enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.black12)),
        focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFEAB308))),
      ),
    );
  }
}
