import 'package:flutter/material.dart';
import 'package:yumto_core/yumto_core.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const YumtoRiderApp());
}

class YumtoRiderApp extends StatelessWidget {
  const YumtoRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haandi - Rider',
      theme: YumtoTheme.lightTheme,
      home: const SplashScreen(
        nextScreen: HaandiLoginScreen(
          portalTitle: 'Haandi Rider App',
          portalSubtitle: 'Live Delivery Dispatch & GPS Navigation',
          allowedRoles: ['RIDER', 'MANAGER', 'OWNER'],
          nextScreen: RiderScreen(),
        ),
      ),
    );
  }
}

class RiderScreen extends StatelessWidget {
  const RiderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Haandi Rider Active Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
            tooltip: 'Sign Out',
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(
                  builder: (_) => const HaandiLoginScreen(
                    portalTitle: 'Haandi Rider App',
                    portalSubtitle: 'Live Delivery Dispatch & GPS Navigation',
                    allowedRoles: ['RIDER', 'MANAGER', 'OWNER'],
                    nextScreen: RiderScreen(),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildDeliveryCard(
            context,
            orderId: 'ORD-ISB-5829',
            customerName: 'Ahsan Khan',
            address: 'House 14, Street 7, Block B, Gulberg Greens, Islamabad',
            timeElapsed: '8m ago',
            status: 'OUT_FOR_DELIVERY',
          ),
          const SizedBox(height: 16),
          _buildDeliveryCard(
            context,
            orderId: 'ORD-ISB-5830',
            customerName: 'Fatima Zahra',
            address: 'Executive Block, Civic Center, Gulberg Greens, Islamabad',
            timeElapsed: '2m ago',
            status: 'READY_FOR_PICKUP',
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(BuildContext context, {required String orderId, required String customerName, required String address, required String timeElapsed, required String status}) {
    bool isReady = status == 'READY_FOR_PICKUP';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(orderId, style: const TextStyle(color: Color(0xFFEAB308), fontWeight: FontWeight.bold, fontSize: 18)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isReady ? Colors.green.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isReady ? 'READY TO PICK' : 'DELIVERING',
                    style: TextStyle(color: isReady ? Colors.green : Colors.blue, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.person, color: Colors.black54, size: 20),
                const SizedBox(width: 8),
                Text(customerName, style: const TextStyle(color: Colors.black87, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, color: Colors.black54, size: 20),
                const SizedBox(width: 8),
                Expanded(child: Text(address, style: const TextStyle(color: Colors.black54, fontSize: 14))),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isReady ? const Color(0xFFFACC15) : Colors.blue,
                  foregroundColor: isReady ? Colors.black : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: () {},
                child: Text(isReady ? 'Confirm Pickup' : 'Mark Delivered', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
