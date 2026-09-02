import 'package:flutter/material.dart';

class YumtoTheme {
  static const Color primaryColor = Color(0xFF8B1E1E); // Rich Terracotta / Brick Red
  static const Color secondaryColor = Color(0xFFE85D04); // Warm Amber / Saffron
  static const Color backgroundColor = Color(0xFFFBF8F3); // Warm Sand / Cream

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: backgroundColor,
        onPrimary: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Color(0xFF2B1810)),
        titleTextStyle: TextStyle(
          color: Color(0xFF2B1810),
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
