import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/section_card.dart';
import '../widgets/info_table.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('О партии')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, Color(0xFF0D1F3C)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('⭐', style: TextStyle(fontSize: 40)),
                ),
                const SizedBox(height: 16),
                Text('НППР — Власть Народу',
                    style: AppTheme.h2, textAlign: TextAlign.center),
                const SizedBox(height: 6),
                Text('Народно-патриотическая партия России',
                    style: AppTheme.caption),
              ],
            ),
          ),
          SectionCard(
            title: 'Основные сведения',
            child: InfoTable(
              rows: const [
                MapEntry('Полное название',
                    'Народно-патриотическая партия России — Власть Народу'),
                MapEntry('Сокращение', 'НППР — Власть Народу'),
                MapEntry('Дата основания', '21 февраля 2016'),
                MapEntry('Принята', 'Учредительный Съезд'),
                MapEntry('Идеология', 'Социогуманизм'),
                MapEntry('Проект', 'Народное государство (с 1997)'),
                MapEntry('Организация',
                    'Ассоциация независимых учёных «Россия XX–XXI»'),
              ],
            ),
          ),
          SectionCard(
            title: 'Контакты',
            child: Column(
              children: const [
                _ContactRow(Icons.language, 'nppr-vlastnarodu.ru'),
                _ContactRow(Icons.email_outlined, 'info@nppr-vlastnarodu.ru'),
                _ContactRow(Icons.send_outlined, 'Telegram · VK · YouTube'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _ContactRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: AppTheme.body)),
        ],
      ),
    );
  }
}
