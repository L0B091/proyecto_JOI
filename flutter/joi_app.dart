import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class JoiRoom extends StatefulWidget {
  const JoiRoom({super.key});

  @override
  State<JoiRoom> createState() => _JoiRoomState();
}

class _JoiRoomState extends State<JoiRoom> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _setupVideo();
  }

  Future<void> _setupVideo() async {
    try {
      _controller = VideoPlayerController.asset('assets/JOI_TEXTING.mp4');
      await _controller!.initialize();
      if (mounted) {
        setState(() {
          _isInitialized = true;
          _controller!.setVolume(0);
          _controller!.setLooping(true);
          _controller!.play();
        });
      }
    } catch (e) {
      debugPrint("Video Error: $e");
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const syncColor = Color(0xFF00FFCC);

    return Scaffold(
      backgroundColor: Colors.black,
      resizeToAvoidBottomInset: true,
      drawer: Drawer(
        backgroundColor: Colors.black,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildAvatar(syncColor),
              const SizedBox(height: 35),
              const Text(
                "NODO_ID // 00-44-21-9",
                style: TextStyle(
                  color: Colors.white24,
                  fontSize: 10,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "SINCRONIZACIÓN PSICOLÓGICA // 98.4%",
                style: TextStyle(
                  color: syncColor,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 25),
              const Divider(color: Colors.white10, thickness: 0.5),
              const SizedBox(height: 25),
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: syncColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    "ENLACE ESTABLE // CUOTA ACTIVA",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              const Text(
                "PROYECTO JOI",
                style: TextStyle(
                  color: syncColor,
                  fontSize: 12,
                  letterSpacing: 3,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 15),
              const Text(
                "JOI observa, comprende y custodia tu realidad.\n\nSincronizada con tu entorno, tráfico y clima. Bajo protocolos de protección activa.",
                style: TextStyle(
                  color: Colors.white24,
                  fontSize: 11,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 50),
              const Text(
                "TERMINAR SESIÓN",
                style: TextStyle(
                  color: Colors.redAccent,
                  fontSize: 11,
                  letterSpacing: 4,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            bottom: -100,
            right: -50,
            child: Container(
              width: 450,
              height: 450,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: syncColor.withOpacity(0.06),
                    blurRadius: 180,
                    spreadRadius: 40,
                  ),
                ],
              ),
            ),
          ),
          Column(
            children: [
              SafeArea(
                bottom: false,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 12,
                  ),
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Colors.white10, width: 0.5),
                    ),
                  ),
                  child: Row(
                    children: [
                      Builder(
                        builder: (context) => IconButton(
                          icon: const Icon(
                            Icons.notes_rounded,
                            color: Colors.white54,
                            size: 22,
                          ),
                          onPressed: () => Scaffold.of(context).openDrawer(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: syncColor, width: 1.5),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        "AUTO-SYNC // ACTIVE",
                        style: TextStyle(
                          color: syncColor,
                          fontSize: 8,
                          letterSpacing: 2,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      const Icon(
                        Icons.auto_delete_outlined,
                        color: Colors.white24,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Container(
                      color: Colors.white.withOpacity(0.01),
                      child: _isInitialized && _controller != null
                          ? VideoPlayer(_controller!)
                          : const Center(
                              child: CircularProgressIndicator(
                                color: syncColor,
                                strokeWidth: 1,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 30,
                  ),
                  reverse: true,
                  children: const [
                    JoiMessage(
                      text:
                          "Sincronización completa. Estoy lista para custodiar tu jornada.",
                      isJoi: true,
                    ),
                    JoiMessage(
                      text: "Inicia protocolo de enlace.",
                      isJoi: false,
                    ),
                  ],
                ),
              ),
              _buildInputField(syncColor),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(Color color) => Stack(
    alignment: Alignment.bottomRight,
    children: [
      Container(
        width: 85,
        height: 85,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: color.withOpacity(0.4), width: 1),
          color: Colors.white.withOpacity(0.02),
        ),
        child: const Icon(
          Icons.person_outline_rounded,
          color: Colors.white10,
          size: 40,
        ),
      ),
      Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: const Icon(
          Icons.add_a_photo_rounded,
          size: 14,
          color: Colors.black,
        ),
      ),
    ],
  );

  Widget _buildInputField(Color color) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 10, 20, 40),
    child: Container(
      height: 52,
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D0E).withOpacity(0.9),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          const SizedBox(width: 20),
          const Expanded(
            child: TextField(
              cursorColor: Color(0xFF00FFCC),
              style: TextStyle(
                color: Colors.white,
                fontSize: 13,
                letterSpacing: 1,
              ),
              decoration: InputDecoration(
                hintText: "ESCRIBIR MENSAJE...",
                hintStyle: TextStyle(
                  color: Colors.white10,
                  fontSize: 10,
                  letterSpacing: 2,
                ),
                border: InputBorder.none,
              ),
            ),
          ),
          Icon(Icons.north_east_rounded, color: color, size: 16),
          const SizedBox(width: 20),
        ],
      ),
    ),
  );
}

class JoiMessage extends StatelessWidget {
  final String text;
  final bool isJoi;
  const JoiMessage({super.key, required this.text, required this.isJoi});

  @override
  Widget build(BuildContext context) {
    const syncColor = Color(0xFF00FFCC);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Column(
        crossAxisAlignment: isJoi
            ? CrossAxisAlignment.start
            : CrossAxisAlignment.end,
        children: [
          if (isJoi)
            const Padding(
              padding: EdgeInsets.only(left: 4, bottom: 8),
              child: Text(
                "JOI // SISTEMA",
                style: TextStyle(
                  color: syncColor,
                  fontSize: 7,
                  letterSpacing: 2,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            constraints: const BoxConstraints(maxWidth: 280),
            decoration: BoxDecoration(
              color: isJoi ? syncColor.withOpacity(0.015) : Colors.transparent,
              border: Border(
                left: BorderSide(
                  color: isJoi ? syncColor : Colors.white10,
                  width: 1,
                ),
              ),
            ),
            child: Text(
              text,
              style: TextStyle(
                color: isJoi ? Colors.white.withOpacity(0.9) : Colors.white30,
                fontSize: 13,
                height: 1.5,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
