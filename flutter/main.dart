import 'package:flutter/material.dart';
import 'joi_room.dart';

void main() {
  runApp(JoiApp());
}

class JoiApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: LoginPage(),
    );
  }
}

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SizedBox(
        width: double.infinity,
        height: double.infinity,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // El Aura Inferior diseñada
            Positioned(
              bottom: -100,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0xFF1E1E22).withValues(alpha: 0.4),
                      blurRadius: 100,
                      spreadRadius: 50,
                    ),
                  ],
                ),
              ),
            ),
            // Logo y Botón
            Positioned(
              bottom: 150,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "JOI",
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w100,
                      color: Colors.white,
                      letterSpacing: 25,
                    ),
                  ),
                  SizedBox(height: 50),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.white10, width: 1.1),
                      padding: EdgeInsets.symmetric(
                        horizontal: 50,
                        vertical: 22,
                      ),
                      shape: StadiumBorder(),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => JoiRoom()),
                      );
                    },
                    child: Text(
                      "INGRESAR CON GOOGLE",
                      style: TextStyle(
                        color: Colors.white60,
                        letterSpacing: 4,
                        fontSize: 10,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
