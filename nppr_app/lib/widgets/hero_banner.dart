import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class HeroBanner extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? imageAsset;
  final String? buttonText;
  final VoidCallback? onButtonTap;

  const HeroBanner({
    super.key,
    required this.title,
    required this.subtitle,
    this.imageAsset,
    this.buttonText,
    this.onButtonTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 240,
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, Color(0xFF0D1F3C)],
        ),
        image: imageAsset != null
            ? DecorationImage(
                image: AssetImage(imageAsset!),
                fit: BoxFit.cover,
                colorFilter: const ColorFilter.mode(
                  Color(0x99000000),
                  BlendMode.darken,
                ),
              )
            : null,
        boxShadow: AppTheme.softShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              title,
              style: GoogleFonts.montserrat(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.w800,
                height: 1.15,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: GoogleFonts.inter(
                color: const Color(0xFFC8D6E5),
                fontSize: 14,
                height: 1.4,
              ),
            ),
            if (buttonText != null) ...[
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onButtonTap,
                child: Text(buttonText!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
