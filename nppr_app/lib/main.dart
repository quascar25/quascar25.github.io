import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/program_screen.dart';
import 'screens/quality_of_life_screen.dart';
import 'screens/control_screen.dart';
import 'screens/democracy_screen.dart';
import 'screens/economy_screen.dart';
import 'screens/social_screen.dart';
import 'screens/constitution_screen.dart';
import 'screens/about_screen.dart';
import 'screens/news_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const NpprApp());
}

class NpprApp extends StatelessWidget {
  const NpprApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'НППР — Власть Народу',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: '/splash',
      routes: {
        '/splash': (_) => const SplashScreen(),
        '/': (_) => const HomeScreen(),
        '/program': (_) => const ProgramScreen(),
        '/quality': (_) => const QualityOfLifeScreen(),
        '/control': (_) => const ControlScreen(),
        '/democracy': (_) => const DemocracyScreen(),
        '/economy': (_) => const EconomyScreen(),
        '/social': (_) => const SocialScreen(),
        '/constitution': (_) => const ConstitutionScreen(),
        '/about': (_) => const AboutScreen(),
        '/news': (_) => const NewsScreen(),
      },
    );
  }
}
