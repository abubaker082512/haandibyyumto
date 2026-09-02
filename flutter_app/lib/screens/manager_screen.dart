import 'package:flutter/material.dart';
import '../mock_db.dart';
import '../models.dart';

class ManagerScreen extends StatelessWidget {
  const ManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final db = MockDatabase();
    
    return Scaffold(
      backgroundColor: const Color(0xFF18181B),
      appBar: AppBar(
        title: const Text('Manager Dashboard'),
        backgroundColor: const Color(0xFF27272A),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Color(0xFFFACC15)),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white70),
            onPressed: () {},
          )
        ],
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 80,
            color: const Color(0xFF27272A),
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
                  const Text('Live Tables', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
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
      child: Icon(icon, color: isActive ? const Color(0xFFFACC15) : Colors.white54, size: 28),
    );
  }

  Widget _buildTableWidget(AppTable table) {
    bool isAvailable = table.status == 'AVAILABLE';
    return Card(
      color: const Color(0xFF27272A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isAvailable ? Colors.green.withOpacity(0.5) : Colors.orange.withOpacity(0.5), width: 2),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 12, left: 12,
            child: Text(table.tableNumber, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          Positioned(
            top: 12, right: 12,
            child: Icon(Icons.group, color: Colors.white54, size: 16),
          ),
          Positioned(
            top: 12, right: 32,
            child: Text('\${table.capacity}', style: const TextStyle(color: Colors.white54, fontSize: 14)),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(isAvailable ? Icons.check_circle : Icons.timer, 
                     color: isAvailable ? Colors.greenAccent : Colors.orangeAccent, size: 36),
                const SizedBox(height: 8),
                Text(table.status, style: TextStyle(color: isAvailable ? Colors.greenAccent : Colors.orangeAccent, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
