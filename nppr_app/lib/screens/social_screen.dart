import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';

class SocialScreen extends StatelessWidget {
  const SocialScreen({super.key});

  static const baseServices = [
    'Подушевые нормативы жилой площади',
    'Жилищно-коммунальное обслуживание',
    'Здравоохранение',
    'Дошкольное воспитание',
    'Среднее и высшее государственное образование',
    'Детский летний отдых',
    'Общественный транспорт',
    'Юридические услуги',
  ];

  static const principles = [
    'Свобода повышения благополучия за счёт труда',
    'Конкурентоспособная оплата бюджетников',
    'Прогрессивная шкала налогов',
    'Ратификация ст. 20 Конвенции ООН против коррупции',
    'Отмена коммерческой тайны для крупных операций',
    'Поддержка профсоюзов',
    'Наука — самостоятельное функционирование',
    'Религия отделена от государства',
    'Запрет пропаганды жестокости, стяжательства, порока',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Социальная политика')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Главенство социальной политики',
            child: Text(
              'В государстве народа сутью социальной политики является '
              'удовлетворение интересов населения не по остаточному принципу, '
              'а как главная обязанность власти.',
              style: AppTheme.body,
            ),
          ),
          SectionCard(
            title: 'Базовые потребности (бесплатно)',
            child: Column(
              children: baseServices.asMap().entries.map((e) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Row(
                    children: [
                      Container(
                        width: 26,
                        height: 26,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('${e.key + 1}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(e.value, style: AppTheme.body)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          SectionCard(
            title: 'Принципы',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: principles.map((p) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check,
                            color: AppColors.accent, size: 18),
                        const SizedBox(width: 10),
                        Expanded(child: Text(p, style: AppTheme.body)),
                      ],
                    ),
                  )).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
