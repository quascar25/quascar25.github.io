import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/info_table.dart';

class QualityOfLifeScreen extends StatelessWidget {
  const QualityOfLifeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Качество жизни')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Цель, объединяющая всех',
            child: Text(
              'На смену экономическим параметрам приходит новая цель — '
              'качество жизни. Она отражает, насколько людям хорошо или плохо, '
              'счастливы они или страдают в реально существующих условиях.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Структура качества жизни',
            child: Column(
              children: [
                _RatioBar(
                  label: 'Экономическое благополучие',
                  percent: 33,
                  color: AppColors.primary,
                ),
                const SizedBox(height: 12),
                _RatioBar(
                  label: 'Духовно-эмоциональная атмосфера',
                  percent: 67,
                  color: AppColors.accent,
                ),
              ],
            ),
          ),
          SectionCard(
            title: 'Параметры качества жизни',
            child: InfoTable(
              leftHeader: 'Категория',
              rightHeader: 'Показатели',
              rows: const [
                MapEntry('Жизнеспособность',
                    'Рождаемость, смертность, продолжительность жизни'),
                MapEntry('Духовное благополучие',
                    'Самоубийства, убийства, свадьбы, сохранение семей'),
                MapEntry('Справедливость',
                    'Грабежи, разбои, поляризация доходов (10%/10%)'),
                MapEntry('Экономический потенциал',
                    'Промпроизводство, сельхоз, инвестиции'),
                MapEntry('Уровень жизни',
                    'Доля ЗП в ВВП, товарооборот, услуги, образование, жильё'),
                MapEntry('Вложения в будущее',
                    'Бюджет на образование, культуру, спорт, экология'),
              ],
            ),
          ),
          SectionCard(
            background: AppColors.primary,
            child: Column(
              children: [
                Text(
                  'Индекс Достойной Жизни Населения',
                  style: AppTheme.h2.copyWith(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  'ИДЖН',
                  style: AppTheme.body.copyWith(
                    color: const Color(0xFFC8D6E5),
                    letterSpacing: 3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RatioBar extends StatelessWidget {
  final String label;
  final int percent;
  final Color color;

  const _RatioBar({
    required this.label,
    required this.percent,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(label, style: AppTheme.body)),
            Text('$percent%',
                style: AppTheme.body.copyWith(
                  fontWeight: FontWeight.w700,
                  color: color,
                )),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: percent / 100,
            minHeight: 8,
            backgroundColor: AppColors.divider,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }
}
