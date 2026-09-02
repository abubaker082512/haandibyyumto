import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:yumto_core/yumto_core.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'providers/cart_provider.dart';
import 'screens/welcome_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const YumtoUserApp(),
    ),
  );
}

class YumtoUserApp extends StatelessWidget {
  const YumtoUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haandi by Yumto',
      theme: YumtoTheme.lightTheme,
      home: const SplashScreen(nextScreen: WelcomeScreen()),
    );
  }
}
