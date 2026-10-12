import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color primary = Color(0xFF1A3A6B);      // глубокий синий
  static const Color accent = Color(0xFFC8102E);       // красный
  static const Color background = Color(0xFFFFFFFF);   // белый
  static const Color surface = Color(0xFFF5F7FA);      // светло-серый
  static const Color textPrimary = Color(0xFF1C1C1E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color divider = Color(0xFFE5E7EB);
  static const Color success = Color(0xFF10B981);
}

class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.accent,
          surface: AppColors.background,
        ),
        textTheme: GoogleFonts.interTextTheme().apply(
          bodyColor: AppColors.textPrimary,
          displayColor: AppColors.primary,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
          centerTitle: true,
          iconTheme: const IconThemeData(color: AppColors.primary),
          titleTextStyle: GoogleFonts.montserrat(
            color: AppColors.primary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        cardTheme: CardTheme(
          color: AppColors.background,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accent,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        drawerTheme: const DrawerThemeData(
          backgroundColor: AppColors.background,
        ),
      );

  static TextStyle h1 = GoogleFonts.montserrat(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.primary,
    height: 1.2,
  );

  static TextStyle h2 = GoogleFonts.montserrat(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
    height: 1.25,
  );

  static TextStyle h3 = GoogleFonts.montserrat(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static TextStyle body = GoogleFonts.inter(
    fontSize: 15,
    height: 1.55,
    color: AppColors.textPrimary,
  );

  static TextStyle caption = GoogleFonts.inter(
    fontSize: 13,
    color: AppColors.textSecondary,
  );

  static const softShadow = [
    BoxShadow(
      color: Color(0x0F000000),
      blurRadius: 20,
      offset: Offset(0, 4),
    ),
  ];
}
