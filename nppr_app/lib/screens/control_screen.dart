import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';

class ControlScreen extends StatelessWidget {
  const ControlScreen({super.key});

  static const steps = [
    'ИДЖН — федеральный уровень',
    'ИДЖН — региональный уровень',
    'ИДЖН — муниципальный уровень',
    'Отчёт Правительства перед Госдумой',
    'Содоклад научных экспертов',
    '«Красные флажки» — предельные значения',
    'Отставка Премьера при нарушении',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Механизм контроля')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Управление через обратную связь',
            child: Text(
              'Желание Отечеству добра не спасает от причинения ему зла. '
              'Требуется надёжный механизм контроля над правильностью '
              'политических решений. Таковым является управление государством '
              'через обратную связь по конечному результату — динамике ИДЖН.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Схема контроля',
            child: Column(
              children: steps.asMap().entries.map((e) {
                final isLast = e.key == steps.length - 1;
                return Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isLast
                            ? AppColors.accent.withOpacity(0.1)
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isLast
                              ? AppColors.accent
                              : AppColors.divider,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isLast
                                  ? AppColors.accent
                                  : AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: Text('${e.key + 1}',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(e.value,
                                style: AppTheme.body.copyWith(
                                    fontWeight: FontWeight.w500)),
                          ),
                        ],
                      ),
                    ),
                    if (!isLast)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 4),
                        child: Icon(Icons.arrow_downward,
                            color: AppColors.textSecondary, size: 20),
                      ),
                  ],
                );
              }).toList(),
            ),
          ),
          SectionCard(
            title: '«Красные флажки»',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _bullet('Выход за пределы в мирное время запрещён'),
                _bullet('Обеспечивает силу ст. 7 Конституции РФ'),
                _bullet('Социальное государство → достойная жизнь'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bullet(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AppColors.accent,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: AppTheme.body)),
        ],
      ),
    );
  }
}
