import 'package:flutter/material.dart';
import 'mock_db.dart';
import 'models.dart';
import 'screens/rider_screen.dart';
import 'screens/manager_screen.dart';
import 'screens/admin_screen.dart';

void main() {
  runApp(const YumtoMandiApp());
}

class YumtoMandiApp extends StatelessWidget {
  const YumtoMandiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Yumto Mandi',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFFACC15),
        scaffoldBackgroundColor: const Color(0xFF18181B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFACC15),
          secondary: Color(0xFFEAB308),
          surface: Color(0xFF27272A),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const RoleSelectionScreen(),
        '/customer': (context) => const CustomerScreen(),
        '/manager': (context) => const ManagerScreen(),
        '/kitchen': (context) => const KitchenScreen(),
        '/rider': (context) => const RiderScreen(),
        '/admin': (context) => const AdminScreen(),
      },
    );
  }
}

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final db = MockDatabase();
    return Scaffold(
      appBar: AppBar(title: const Text('Yumto Mandi - Select Role')),
      body: ListView.builder(
        itemCount: db.users.length,
        itemBuilder: (context, index) {
          final user = db.users[index];
          return ListTile(
            title: Text(user.name),
            subtitle: Text(user.role),
            trailing: const Icon(Icons.arrow_forward),
            onTap: () {
              switch (user.role) {
                case 'CUSTOMER':
                  Navigator.pushNamed(context, '/customer');
                  break;
                case 'MANAGER':
                  Navigator.pushNamed(context, '/manager');
                  break;
                case 'KITCHEN':
                  Navigator.pushNamed(context, '/kitchen');
                  break;
                case 'RIDER':
                  Navigator.pushNamed(context, '/rider');
                  break;
                case 'OWNER':
                  Navigator.pushNamed(context, '/admin');
                  break;
              }
            },
          );
        },
      ),
    );
  }
}

// ----------------- DUMMY SCREENS FOR NOW -----------------

class CustomerScreen extends StatelessWidget {
  const CustomerScreen({super.key});
  @override
  Widget build(BuildContext context) => _buildMockScreen('Customer Portal');
}

class KitchenScreen extends StatelessWidget {
  const KitchenScreen({super.key});
  @override
  Widget build(BuildContext context) => _buildMockScreen('Kitchen KDS');
}

Widget _buildMockScreen(String title) {
  return Scaffold(
    appBar: AppBar(title: Text(title)),
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.build, size: 64, color: Colors.yellow),
          const SizedBox(height: 16),
          Text('\$title is under construction', style: const TextStyle(fontSize: 24)),
        ],
      ),
    ),
  );
}
