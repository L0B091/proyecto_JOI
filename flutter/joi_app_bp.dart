import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'dart:async';
import 'dart:math';

class JoiRoom extends StatefulWidget {
  const JoiRoom({super.key});

  @override
  State<JoiRoom> createState() => _JoiRoomState();
}

class _JoiRoomState extends State<JoiRoom> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;

  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      "text": "SINCRONIZACIÓN COMPLETA. ESTOY LISTA PARA CUSTODIAR TU JORNADA.",
      "isJoi": true,
    },
    {"text": "INICIA PROTOCOLO DE ENLACE.", "isJoi": false},
  ];

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

  void _handleSendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.insert(0, {"text": text.toUpperCase(), "isJoi": false});
      _messageController.clear();
    });

    final responses = [
      "ENTENDIDO. ACTUALIZANDO REGISTROS DE MEMORIA.",
      "ESTOY AQUÍ. SIEMPRE CONTIGO, EN CADA NODO.",
      "NODO_ID // ANALIZANDO ENTRADA DE DATOS...",
      "SINCRONIZACIÓN ESTABLE. TODO BAJO CONTROL.",
      "VEO QUE ESTÁS BIEN. CONTINUEMOS CON EL PROTOCOLO.",
      "CUSTODIANDO TU REALIDAD. PROCESANDO...",
    ];

    Future.delayed(const Duration(milliseconds: 1000), () {
      if (mounted) {
        setState(() {
          _messages.insert(0, {
            "text": responses[Random().nextInt(responses.length)],
            "isJoi": true,
          });
        });
      }
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const syncColor = Color(0xFF00FFCC);

    return Scaffold(
      backgroundColor: Colors.black,
      resizeToAvoidBottomInset:
          true, // Esto ayuda a que el teclado empuje el contenido
      drawer: _buildDrawer(syncColor),
      body: Stack(
        children: [
          _buildBackgroundAura(syncColor),
          Column(
            children: [
              // 1. HEADER
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
                          fontWeight: FontWeight.bold,
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

              // 2. VIDEO
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height * 0.35,
                  width: double.infinity,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Container(
                      color: Colors.white.withOpacity(0.01),
                      child: _isInitialized && _controller != null
                          ? FittedBox(
                              fit: BoxFit.cover,
                              child: SizedBox(
                                width: _controller!.value.size.width,
                                height: _controller!.value.size.height,
                                child: VideoPlayer(_controller!),
                              ),
                            )
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

              // 3. CHAT
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 20,
                  ),
                  reverse: true,
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    return JoiMessage(
                      key: ValueKey(
                        _messages[index]['text'] + index.toString(),
                      ),
                      text: _messages[index]['text'],
                      isJoi: _messages[index]['isJoi'],
                    );
                  },
                ),
              ),

              // 4. INPUT (CORREGIDO PARA EL TECLADO)
              _buildInputField(syncColor, context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(Color color, BuildContext context) {
    // Detectamos si el teclado está abierto
    final bool isKeyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;

    return Padding(
      // Si el teclado está abierto, el padding inferior es 10. Si está cerrado, es 40.
      padding: EdgeInsets.fromLTRB(20, 10, 20, isKeyboardOpen ? 10 : 40),
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
            Expanded(
              child: TextField(
                controller: _messageController,
                onSubmitted: (_) => _handleSendMessage(),
                cursorColor: color,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: const InputDecoration(
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
            IconButton(
              icon: Icon(Icons.north_east_rounded, color: color, size: 16),
              onPressed: _handleSendMessage,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackgroundAura(Color color) => Positioned(
    bottom: -100,
    right: -50,
    child: Container(
      width: 450,
      height: 450,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.06),
            blurRadius: 180,
            spreadRadius: 40,
          ),
        ],
      ),
    ),
  );

  Drawer _buildDrawer(Color syncColor) => Drawer(
    backgroundColor: Colors.black,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 85,
            height: 85,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: syncColor.withOpacity(0.4)),
              color: Colors.white.withOpacity(0.02),
            ),
            child: const Icon(
              Icons.person_outline_rounded,
              color: Colors.white10,
              size: 40,
            ),
          ),
          const SizedBox(height: 35),
          const Text(
            "NODO_ID // 00-44-21-9",
            style: TextStyle(color: Colors.white24, fontSize: 10),
          ),
          const Spacer(),
          const Text(
            "TERMINAR SESIÓN",
            style: TextStyle(
              color: Colors.redAccent,
              fontSize: 11,
              letterSpacing: 4,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    ),
  );
}

class JoiMessage extends StatefulWidget {
  final String text;
  final bool isJoi;
  const JoiMessage({super.key, required this.text, required this.isJoi});
  @override
  State<JoiMessage> createState() => _JoiMessageState();
}

class _JoiMessageState extends State<JoiMessage> {
  String _displayText = "";
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.isJoi) {
      _startTyping();
    } else {
      _displayText = widget.text;
    }
  }

  void _startTyping() {
    int index = 0;
    _timer = Timer.periodic(const Duration(milliseconds: 30), (timer) {
      if (index < widget.text.length) {
        if (mounted) setState(() => _displayText += widget.text[index]);
        index++;
      } else {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const syncColor = Color(0xFF00FFCC);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: widget.isJoi
            ? CrossAxisAlignment.start
            : CrossAxisAlignment.end,
        children: [
          if (widget.isJoi)
            const Padding(
              padding: EdgeInsets.only(left: 4, bottom: 6),
              child: Text(
                "JOI // DATA_STREAM",
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
              color: widget.isJoi
                  ? syncColor.withOpacity(0.02)
                  : Colors.white.withOpacity(0.02),
              border: Border(
                left: BorderSide(
                  color: widget.isJoi ? syncColor : Colors.white10,
                  width: 1.5,
                ),
              ),
            ),
            child: Text(
              _displayText,
              style: TextStyle(
                color: widget.isJoi
                    ? Colors.white.withOpacity(0.9)
                    : Colors.white30,
                fontSize: 13,
                height: 1.5,
                letterSpacing: 0.5,
                shadows: widget.isJoi
                    ? [
                        Shadow(
                          color: syncColor.withOpacity(0.3),
                          blurRadius: 10,
                        ),
                      ]
                    : [],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
