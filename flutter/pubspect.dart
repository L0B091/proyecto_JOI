name: joi_app
description: "Joi Blade Runner App"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
 
  # Motor de video para Moto g04s
  video_player: ^2.8.1
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true

  # Registro directo del archivo en la raíz de assets
  assets:
    - assets/JOI_TEXTING.mp4

 