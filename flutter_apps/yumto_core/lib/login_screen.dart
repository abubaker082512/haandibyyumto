import 'package:flutter/material.dart';
import 'mock_db.dart';
import 'models.dart';
import 'theme.dart';

class HaandiLoginScreen extends StatefulWidget {
  final String portalTitle;
  final String portalSubtitle;
  final List<String> allowedRoles;
  final Widget nextScreen;
  final bool allowGuest;
  final VoidCallback? onGuestContinue;

  const HaandiLoginScreen({
    super.key,
    required this.portalTitle,
    this.portalSubtitle = 'Civic Center, Gulberg Greens, Islamabad',
    required this.allowedRoles,
    required this.nextScreen,
    this.allowGuest = false,
    this.onGuestContinue,
  });

  @override
  State<HaandiLoginScreen> createState() => _HaandiLoginScreenState();
}

class _HaandiLoginScreenState extends State<HaandiLoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;
  bool _isLoading = false;

  final db = MockDatabase();

  // Map of preset demo credentials matching CREDENTIALS.md
  static const Map<String, Map<String, String>> rolePresets = {
    'OWNER': {'user': 'owner', 'name': 'Haandi Owner', 'pass': 'Haandi@2026'},
    'MANAGER': {'user': 'manager', 'name': 'Bilal Manager', 'pass': 'Haandi@2026'},
    'CASHIER': {'user': 'cashier', 'name': 'Nadia Cashier', 'pass': 'Haandi@2026'},
    'KITCHEN': {'user': 'kitchen', 'name': 'Chef Tariq', 'pass': 'Haandi@2026'},
    'RIDER': {'user': 'rider', 'name': 'Zahid Rider', 'pass': 'Haandi@2026'},
    'CUSTOMER': {'user': 'customer', 'name': 'Abubakar Customer', 'pass': 'Haandi@2026'},
  };

  void _handleLogin() async {
    final input = _usernameController.text.trim().toLowerCase();
    final pass = _passwordController.text;

    if (input.isEmpty || pass.isEmpty) {
      setState(() => _errorMessage = 'Please enter both username and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await Future.delayed(const Duration(milliseconds: 400));

    // Check against preset passwords
    const validPasswords = ['Haandi@2026', 'haandi123', '123456'];
    if (!validPasswords.contains(pass)) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Incorrect password. Default is: Haandi@2026';
      });
      return;
    }

    // Match user by username or role
    UserProfile? matchedUser;
    for (final u in db.users) {
      final roleKey = u.role.toUpperCase();
      final preset = rolePresets[roleKey];
      if (preset != null && (preset['user'] == input || u.name.toLowerCase().contains(input))) {
        matchedUser = u;
        break;
      }
      if (u.id.toLowerCase() == input || u.name.toLowerCase() == input) {
        matchedUser = u;
        break;
      }
    }

    // Fallback match based on allowed roles if input matches role name
    if (matchedUser == null) {
      for (final role in widget.allowedRoles) {
        final preset = rolePresets[role];
        if (preset != null && preset['user'] == input) {
          matchedUser = db.users.firstWhere((u) => u.role == role, orElse: () => db.users.first);
          break;
        }
      }
    }

    if (matchedUser == null) {
      // Default to the first allowed role user for flexibility
      final targetRole = widget.allowedRoles.first;
      matchedUser = db.users.firstWhere(
        (u) => u.role == targetRole,
        orElse: () => db.users.first,
      );
    }

    // Enforce role authorization
    if (!widget.allowedRoles.contains(matchedUser.role)) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Access Denied: ${matchedUser!.name} (${matchedUser.role}) is not authorized for ${widget.portalTitle}. Requires: ${widget.allowedRoles.join(' or ')}.';
      });
      return;
    }

    setState(() => _isLoading = false);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => widget.nextScreen),
      );
    }
  }

  void _quickFill(String role) {
    final preset = rolePresets[role];
    if (preset != null) {
      _usernameController.text = preset['user']!;
      _passwordController.text = preset['pass']!;
      setState(() => _errorMessage = null);
      _handleLogin();
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryRole = widget.allowedRoles.first;
    final presetInfo = rolePresets[primaryRole] ?? rolePresets['MANAGER']!;

    return Scaffold(
      backgroundColor: YumtoTheme.backgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Haandi Logo Card
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 16,
                        offset: Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      'packages/yumto_core/assets/logo.png',
                      width: 90,
                      height: 90,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.restaurant_menu,
                        size: 60,
                        color: YumtoTheme.primaryColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Title & Subtitle
                Text(
                  widget.portalTitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1A120B),
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.portalSubtitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6B5B4C),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: YumtoTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: YumtoTheme.primaryColor.withOpacity(0.3)),
                  ),
                  child: Text(
                    '📍 Gulberg Greens, Islamabad',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: YumtoTheme.primaryColor,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Error alert
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEF4444)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: Color(0xFF991B1B), fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Quick Login 1-Click Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : () => _quickFill(primaryRole),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: YumtoTheme.secondaryColor,
                      foregroundColor: Colors.white,
                      elevation: 2,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.bolt, size: 20, color: Color(0xFFF4C430)),
                    label: Text(
                      'One-Click Demo Login as ${presetInfo['name']}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),

                const SizedBox(height: 16),
                Row(
                  children: [
                    const Expanded(child: Divider(color: Color(0xFFEADBCC))),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Text('OR SIGN IN', style: TextStyle(fontSize: 10, color: Colors.grey[500], fontWeight: FontWeight.bold)),
                    ),
                    const Expanded(child: Divider(color: Color(0xFFEADBCC))),
                  ],
                ),
                const SizedBox(height: 16),

                // Card with credentials form
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEADBCC)),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Username field
                      TextField(
                        controller: _usernameController,
                        decoration: InputDecoration(
                          labelText: 'Username or Email',
                          hintText: presetInfo['user'],
                          prefixIcon: const Icon(Icons.person, color: Color(0xFF8B1E1E), size: 20),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Password field
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Haandi@2026',
                          prefixIcon: const Icon(Icons.lock, color: Color(0xFF8B1E1E), size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey[600],
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: YumtoTheme.primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : Text(
                                  'Sign In to ${widget.portalTitle}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Guest checkout option for customer app
                if (widget.allowGuest) ...[
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: widget.onGuestContinue ?? () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => widget.nextScreen),
                      );
                    },
                    icon: const Icon(Icons.arrow_forward, size: 16, color: Color(0xFF8B1E1E)),
                    label: const Text(
                      'Continue as Guest (No Sign In Required)',
                      style: TextStyle(color: Color(0xFF8B1E1E), fontWeight: FontWeight.bold),
                    ),
                  ),
                ],

                const SizedBox(height: 16),
                const Text(
                  'Default Password for all staff: Haandi@2026\nHaandi by Yumto Restaurant OS',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF), height: 1.4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
