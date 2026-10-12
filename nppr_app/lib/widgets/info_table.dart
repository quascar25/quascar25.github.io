import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class InfoTable extends StatelessWidget {
  final List<MapEntry<String, String>> rows;
  final String? leftHeader;
  final String? rightHeader;

  const InfoTable({
    super.key,
    required this.rows,
    this.leftHeader,
    this.rightHeader,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.divider),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          if (leftHeader != null && rightHeader != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(leftHeader!,
                        style: AppTheme.caption.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary)),
                  ),
                  Expanded(
                    child: Text(rightHeader!,
                        style: AppTheme.caption.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary)),
                  ),
                ],
              ),
            ),
          ...rows.asMap().entries.map((e) {
            final isLast = e.key == rows.length - 1;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                border: isLast
                    ? null
                    : const Border(
                        bottom: BorderSide(color: AppColors.divider),
                      ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(e.value.key,
                        style: AppTheme.body.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(e.value.value, style: AppTheme.body),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
