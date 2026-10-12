import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class QuoteBlock extends StatelessWidget {
  final String text;
  final String? author;

  const QuoteBlock({super.key, required this.text, this.author});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: const Border(
          left: BorderSide(color: AppColors.accent, width: 4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '«$text»',
            style: GoogleFonts.inter(
              fontSize: 16,
              height: 1.55,
              fontStyle: FontStyle.italic,
              color: AppColors.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (author != null) ...[
            const SizedBox(height: 10),
            Text('— $author', style: AppTheme.caption),
          ],
        ],
      ),
    );
  }
}
