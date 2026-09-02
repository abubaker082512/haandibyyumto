import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:yumto_core/yumto_core.dart';
import '../providers/cart_provider.dart';
import 'location_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A120B),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Sign In / Account button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_on, color: Color(0xFFE85D04), size: 14),
                        SizedBox(width: 4),
                        Text(
                          'Gulberg Greens, Islamabad',
                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => HaandiLoginScreen(
                            portalTitle: 'Haandi Customer Account',
                            portalSubtitle: 'Track orders, loyalty & fast checkout',
                            allowedRoles: const ['CUSTOMER', 'MANAGER', 'OWNER'],
                            allowGuest: true,
                            nextScreen: const WelcomeScreen(),
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.person, color: Color(0xFFF4C430), size: 16),
                    label: const Text(
                      'Sign In',
                      style: TextStyle(color: Color(0xFFF4C430), fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

            // Hero Brand Section
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFE85D04).withOpacity(0.3),
                              blurRadius: 24,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.asset(
                            'packages/yumto_core/assets/logo.png',
                            width: 130,
                            height: 130,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => const Icon(
                              Icons.restaurant,
                              size: 80,
                              color: Color(0xFF8B1E1E),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'HAANDI BY YUMTO',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Authentic Handi, Karahi, Desi & Charcoal BBQ',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFFE85D04),
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B1E1E).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF8B1E1E)),
                        ),
                        child: const Text(
                          '⚡ 2.5 km Delivery Radius · Advance Prepayment Only',
                          style: TextStyle(color: Color(0xFFF4C430), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Order Selection Bottom Sheet
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
              decoration: const BoxDecoration(
                color: Color(0xFFFBF8F3),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(28),
                  topRight: Radius.circular(28),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 20,
                    offset: Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "Select Your Dining Mode",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1A120B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Order authentic food prepared fresh to your taste",
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF6B5B4C),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildOption(context, 'Delivery', Icons.two_wheeler, 'Delivery'),
                      _buildOption(context, 'Pickup', Icons.shopping_bag, 'Pickup'),
                      _buildOption(context, 'Dine-In', Icons.table_restaurant, 'Dine-In'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(BuildContext context, String title, IconData icon, String type) {
    return GestureDetector(
      onTap: () {
        context.read<CartProvider>().setOrderType(type);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LocationScreen()),
        );
      },
      child: Column(
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFEADBCC), width: 2),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 10,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, size: 36, color: const Color(0xFF8B1E1E)),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 13,
              color: Color(0xFF1A120B),
            ),
          ),
        ],
      ),
    );
  }
}
