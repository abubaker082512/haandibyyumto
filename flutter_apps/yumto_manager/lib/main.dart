import 'package:flutter/material.dart';
import 'package:yumto_core/yumto_core.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const YumtoManagerApp());
}

class YumtoManagerApp extends StatelessWidget {
  const YumtoManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haandi - Manager',
      theme: YumtoTheme.lightTheme,
      home: const SplashScreen(
        nextScreen: HaandiLoginScreen(
          portalTitle: 'Haandi Manager Portal',
          portalSubtitle: 'Table Assignments & Floor Operations',
          allowedRoles: ['MANAGER', 'OWNER'],
          nextScreen: ManagerScreen(),
        ),
      ),
    );
  }
}

class ManagerScreen extends StatelessWidget {
  const ManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final db = MockDatabase();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manager Dashboard (Islamabad)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
            tooltip: 'Sign Out',
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(
                  builder: (_) => const HaandiLoginScreen(
                    portalTitle: 'Haandi Manager Portal',
                    portalSubtitle: 'Table Assignments & Floor Operations',
                    allowedRoles: ['MANAGER', 'OWNER'],
                    nextScreen: ManagerScreen(),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 80,
            color: Colors.grey[100],
            child: Column(
              children: [
                const SizedBox(height: 16),
                _buildNavIcon(Icons.dashboard, true),
                _buildNavIcon(Icons.table_restaurant, false),
                _buildNavIcon(Icons.fastfood, false),
                _buildNavIcon(Icons.people, false),
              ],
            ),
          ),
          // Main Content Area
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Live Tables', style: TextStyle(color: Colors.black87, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: db.tables.length,
                      itemBuilder: (context, index) {
                        final table = db.tables[index];
                        return _buildTableWidget(table);
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

  Widget _buildNavIcon(IconData icon, bool isActive) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFFFACC15).withOpacity(0.2) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: isActive ? const Color(0xFFEAB308) : Colors.black54, size: 28),
    );
  }

  Widget _buildTableWidget(AppTable table) {
    bool isAvailable = table.status == 'AVAILABLE';
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isAvailable ? Colors.green.withOpacity(0.5) : Colors.orange.withOpacity(0.5), width: 2),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 12, left: 12,
            child: Text(table.tableNumber, style: const TextStyle(color: Colors.black87, fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          Positioned(
            top: 12, right: 12,
            child: Icon(Icons.group, color: Colors.black54, size: 16),
          ),
          Positioned(
            top: 12, right: 32,
            child: Text('${table.capacity}', style: const TextStyle(color: Colors.black54, fontSize: 14)),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(isAvailable ? Icons.check_circle : Icons.timer, 
                     color: isAvailable ? Colors.green : Colors.orange, size: 36),
                const SizedBox(height: 8),
                Text(table.status, style: TextStyle(color: isAvailable ? Colors.green : Colors.orange, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
