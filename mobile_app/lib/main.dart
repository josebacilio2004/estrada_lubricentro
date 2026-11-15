import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0B0D12),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const EstradaErpMobileApp());
}

// ============================================================================
// INFORMACIÓN DE VERSIÓN DE LA APP
// ============================================================================
class EstradaAppVersion {
  static const String version = '1.2.0';
  static const int buildNumber = 2;
  static const String releaseDate = 'Noviembre 2026';
  static const String codename = 'Laser Focus HD';
  static const String fullString = 'v$version (Build $buildNumber)';
}

// ============================================================================
// SYSTEM DESIGN TOKENS (Idénticos al ERP Web Lubricentros Estrada)
// ============================================================================
class EstradaTheme {
  static const Color ink950 = Color(0xFF0B0D12);
  static const Color ink900 = Color(0xFF101217);
  static const Color panelBg = Color(0xFF151820);
  static const Color cardBg = Color(0xFF1A1E27);
  static const Color cardSubtle = Color(0xFF222734);
  static const Color ember500 = Color(0xFFF26A1B);
  static const Color ember600 = Color(0xFFD9560E);
  static const Color amber400 = Color(0xFFF59E0B);
  static const Color emerald400 = Color(0xFF10B981);
  static const Color emerald500 = Color(0xFF059669);
  static const Color red400 = Color(0xFFEF4444);
  static const Color textHi = Color(0xFFF9FAFB);
  static const Color textLo = Color(0xFF9CA3AF);
  static const Color textDim = Color(0xFF6B7280);
  static const Color borderSubtle = Color(0x1FFFFFFF);
}

class EstradaErpMobileApp extends StatelessWidget {
  const EstradaErpMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lubricentros Estrada ERP',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: EstradaTheme.ink950,
        primaryColor: EstradaTheme.ember500,
        colorScheme: const ColorScheme.dark(
          primary: EstradaTheme.ember500,
          secondary: EstradaTheme.amber400,
          surface: EstradaTheme.panelBg,
          error: EstradaTheme.red400,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const EstradaMainShell(),
    );
  }
}

// ============================================================================
// MODELOS DE DATOS CONECTADOS A POSTGRESQL (DOCKER)
// ============================================================================
class ProductModel {
  final String id;
  final String sku;
  final String barcode;
  final String name;
  final String description;
  final String categoryId;
  final String brandId;
  final String presentation;
  final double purchasePrice;
  final double salePrice;
  final double stockCurrent;
  final double stockMin;
  final String imageUrl;
  final String brandName;
  final String categoryName;
  final String viscosity;
  final String oilType;
  final String apiNorm;
  final int lifespanKm;

  ProductModel({
    required this.id,
    required this.sku,
    required this.barcode,
    required this.name,
    required this.description,
    required this.categoryId,
    required this.brandId,
    required this.presentation,
    required this.purchasePrice,
    required this.salePrice,
    required this.stockCurrent,
    required this.stockMin,
    required this.imageUrl,
    required this.brandName,
    required this.categoryName,
    required this.viscosity,
    required this.oilType,
    required this.apiNorm,
    required this.lifespanKm,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final specs = (json['technical_specs'] is Map<String, dynamic>)
        ? json['technical_specs'] as Map<String, dynamic>
        : <String, dynamic>{};
    return ProductModel(
      id: (json['id'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      barcode: (json['barcode'] ?? '').toString(),
      name: (json['name'] ?? 'Producto sin nombre').toString(),
      description: (json['description'] ?? '').toString(),
      categoryId: (json['category_id'] ?? '').toString(),
      brandId: (json['brand_id'] ?? '').toString(),
      presentation: (json['presentation'] ?? 'Unidad').toString(),
      purchasePrice: _toDouble(json['purchase_price']),
      salePrice: _toDouble(json['sale_price']),
      stockCurrent: _toDouble(json['stock_current']),
      stockMin: _toDouble(json['stock_min']),
      imageUrl: (json['image_url'] ?? '').toString(),
      brandName: (json['brand_name'] ?? '').toString(),
      categoryName: (json['category_name'] ?? '').toString(),
      viscosity: (specs['viscosity'] ?? '').toString(),
      oilType: (specs['oil_type'] ?? '').toString(),
      apiNorm: (specs['api_norm'] ?? '').toString(),
      lifespanKm: (specs['lifespan_km'] is int)
          ? specs['lifespan_km'] as int
          : int.tryParse(specs['lifespan_km']?.toString() ?? '5000') ?? 5000,
    );
  }

  static double _toDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0.0;
  }
}

class PosCartItem {
  final ProductModel product;
  int quantity;

  PosCartItem({required this.product, this.quantity = 1});

  double get subtotal => product.salePrice * quantity;
}

// ============================================================================
// COMPONENTE VISOR DE CÁMARA HD CON ZOOM ÓPTICO Y LÁSER ESTRADA
// ============================================================================
class EstradaCameraViewfinder extends StatefulWidget {
  final MobileScannerController controller;
  final Function(String code) onBarcodeDetected;
  final double height;
  final String statusHint;
  final Color accentColor;

  const EstradaCameraViewfinder({
    super.key,
    required this.controller,
    required this.onBarcodeDetected,
    this.height = 260,
    this.statusHint = 'Centra el código de barras aquí',
    this.accentColor = EstradaTheme.ember500,
  });

  @override
  State<EstradaCameraViewfinder> createState() => _EstradaCameraViewfinderState();
}

class _EstradaCameraViewfinderState extends State<EstradaCameraViewfinder>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _scanLineAnim;
  bool _torchOn = false;
  double _zoomScale = 0.0; // 0.0 = 1x, 0.28 = 1.5x, 0.55 = 2.0x

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _scanLineAnim = Tween<double>(begin: 0.15, end: 0.85).animate(
      CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  Future<void> _setZoom(double zoom) async {
    setState(() => _zoomScale = zoom);
    try {
      await widget.controller.setZoomScale(zoom);
      HapticFeedback.selectionClick();
    } catch (_) {}
  }

  Future<void> _toggleTorch() async {
    setState(() => _torchOn = !_torchOn);
    try {
      await widget.controller.toggleTorch();
      HapticFeedback.lightImpact();
    } catch (_) {}
  }

  Future<void> _switchCamera() async {
    try {
      await widget.controller.switchCamera();
      HapticFeedback.lightImpact();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: EstradaTheme.borderSubtle, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(21),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Cámara HD con Autoenfoque continuo
            MobileScanner(
              controller: widget.controller,
              onDetect: (capture) {
                for (final b in capture.barcodes) {
                  final raw = b.rawValue;
                  if (raw != null && raw.trim().isNotEmpty) {
                    HapticFeedback.mediumImpact();
                    widget.onBarcodeDetected(raw.trim());
                    break;
                  }
                }
              },
            ),

            // Sombra perimetral para oscurecer fuera del área de foco
            Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  radius: 0.95,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.55),
                  ],
                ),
              ),
            ),

            // Marco con esquinas láser iluminadas
            SizedBox(
              width: 250,
              height: 140,
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    left: 0,
                    child: _buildCorner(top: true, left: true),
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: _buildCorner(top: true, left: false),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    child: _buildCorner(top: false, left: true),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: _buildCorner(top: false, left: false),
                  ),

                  // Haz láser animado en movimiento vertical
                  AnimatedBuilder(
                    animation: _scanLineAnim,
                    builder: (ctx, _) {
                      return Positioned(
                        top: 140 * _scanLineAnim.value,
                        left: 10,
                        right: 10,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            color: widget.accentColor,
                            boxShadow: [
                              BoxShadow(
                                color: widget.accentColor.withValues(alpha: 0.9),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Barra Superior de Controles de Cámara (Linterna y Cambiar Lente)
            Positioned(
              top: 10,
              right: 10,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _glassCircleButton(
                    icon: _torchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                    color: _torchOn ? EstradaTheme.amber400 : Colors.white70,
                    active: _torchOn,
                    tooltip: 'Linterna',
                    onTap: _toggleTorch,
                  ),
                  const SizedBox(width: 8),
                  _glassCircleButton(
                    icon: Icons.flip_camera_ios_rounded,
                    color: Colors.white70,
                    active: false,
                    tooltip: 'Rotar Cámara',
                    onTap: _switchCamera,
                  ),
                ],
              ),
            ),

            // Selector Rápido de Zoom (1.0x / 1.5x / 2.0x) para enfocar sin acercar demasiado el teléfono
            Positioned(
              bottom: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.75),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: EstradaTheme.borderSubtle),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _zoomPill('1.0x', 0.0),
                    const SizedBox(width: 4),
                    _zoomPill('1.5x', 0.28),
                    const SizedBox(width: 4),
                    _zoomPill('2.0x', 0.55),
                  ],
                ),
              ),
            ),

            // Píldora de estado en la parte superior izquierda
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.75),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: widget.accentColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: widget.accentColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      widget.statusHint,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCorner({required bool top, required bool left}) {
    const double size = 22;
    const double width = 3;
    final color = widget.accentColor;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        border: Border(
          top: top ? BorderSide(color: color, width: width) : BorderSide.none,
          bottom: !top ? BorderSide(color: color, width: width) : BorderSide.none,
          left: left ? BorderSide(color: color, width: width) : BorderSide.none,
          right: !left ? BorderSide(color: color, width: width) : BorderSide.none,
        ),
      ),
    );
  }

  Widget _glassCircleButton({
    required IconData icon,
    required Color color,
    required bool active,
    required String tooltip,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: active
              ? EstradaTheme.amber400.withValues(alpha: 0.25)
              : Colors.black.withValues(alpha: 0.65),
          shape: BoxShape.circle,
          border: Border.all(
            color: active ? EstradaTheme.amber400 : Colors.white24,
            width: 1.2,
          ),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  Widget _zoomPill(String label, double zoomVal) {
    final isSelected = (_zoomScale - zoomVal).abs() < 0.1;
    return InkWell(
      onTap: () => _setZoom(zoomVal),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? widget.accentColor : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : EstradaTheme.textLo,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// SHELL PRINCIPAL CON GESTIÓN DE TÚNEL Y PESTAÑAS
// ============================================================================
class EstradaMainShell extends StatefulWidget {
  const EstradaMainShell({super.key});

  @override
  State<EstradaMainShell> createState() => _EstradaMainShellState();
}

class _EstradaMainShellState extends State<EstradaMainShell> {
  int _selectedIndex = 0;

  static const String defaultTunnelUrl =
      'https://sharing-carbon-trade-certificate.trycloudflare.com';
  static const String defaultLanUrl = 'http://192.168.1.8:8088';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:8088';

  String _baseUrl = defaultTunnelUrl;
  bool _isConnected = false;
  bool _checkingConnection = true;

  List<ProductModel> _products = [];
  List<Map<String, String>> _categories = [];
  List<Map<String, String>> _brands = [];
  final List<PosCartItem> _posCart = [];

  @override
  void initState() {
    super.initState();
    _initConnectionAndLoad();
  }

  Future<void> _initConnectionAndLoad() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('estrada_api_base_url');

    final candidates = <String>[
      if (savedUrl != null && savedUrl.isNotEmpty) savedUrl,
      defaultTunnelUrl,
      defaultLanUrl,
      defaultEmulatorUrl,
    ];

    for (final candidate in candidates) {
      final ok = await _pingServer(candidate);
      if (ok) {
        setState(() {
          _baseUrl = candidate;
          _isConnected = true;
          _checkingConnection = false;
        });
        await prefs.setString('estrada_api_base_url', candidate);
        await _loadAllData();
        return;
      }
    }

    setState(() {
      _checkingConnection = false;
      _isConnected = false;
    });
    await _loadAllData();
  }

  Future<bool> _pingServer(String url) async {
    try {
      final clean = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
      final res = await http
          .get(Uri.parse('$clean/v1/health'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (_) {}
    return false;
  }

  String resolveImageUrl(String rawUrl) {
    if (rawUrl.isEmpty) {
      return '$_baseUrl/media/line-synthetic.png';
    }
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    final cleanBase =
        _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
    final cleanPath = rawUrl.startsWith('/') ? rawUrl : '/$rawUrl';
    return '$cleanBase$cleanPath';
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      _fetchProducts(),
      _fetchCategories(),
      _fetchBrands(),
    ]);
  }

  Future<void> _fetchProducts({String query = ''}) async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http
          .get(Uri.parse('$clean/v1/products?q=${Uri.encodeComponent(query)}'))
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          final list = (body['data'] as List)
              .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
              .toList();
          setState(() {
            _products = list;
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchCategories() async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.get(Uri.parse('$clean/v1/categories'));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          setState(() {
            _categories = (body['data'] as List)
                .map((e) => {
                      'id': e['id'].toString(),
                      'name': e['name'].toString(),
                    })
                .toList();
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchBrands() async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.get(Uri.parse('$clean/v1/brands'));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          setState(() {
            _brands = (body['data'] as List)
                .map((e) => {
                      'id': e['id'].toString(),
                      'name': e['name'].toString(),
                    })
                .toList();
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _sendProductToPosWeb(ProductModel prod) async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.post(
        Uri.parse('$clean/v1/pos/scan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'barcode': prod.barcode.isNotEmpty ? prod.barcode : prod.sku,
          'quantity': 1,
          'session_id': 'estrada_mobile_session',
        }),
      );
      if (res.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: EstradaTheme.emerald500,
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '¡${prod.name} cargado en POS Web!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: EstradaTheme.red400,
          content: Text('Error al enviar al POS Web: $e'),
        ),
      );
    }
  }

  void _showAppVersionDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: EstradaTheme.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: EstradaTheme.borderSubtle),
        ),
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: EstradaTheme.ember500,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Text(
                'E',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Estrada ERP Mobile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  EstradaAppVersion.fullString,
                  style: TextStyle(
                    color: EstradaTheme.ember500,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _versionRow('Versión:', EstradaAppVersion.version),
            _versionRow('Compilación:', 'Build ${EstradaAppVersion.buildNumber} (${EstradaAppVersion.releaseDate})'),
            _versionRow('Cámara:', 'HD 1080p + Zoom Táctil (1x / 1.5x / 2x)'),
            _versionRow('Escáner:', 'EAN-13, EAN-8, Code 128, QR'),
            _versionRow('Base de Datos:', 'PostgreSQL Docker (Media Blobs)'),
            _versionRow('Sincronización:', 'En tiempo real con POS Web'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: EstradaTheme.ink950,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: EstradaTheme.borderSubtle),
              ),
              child: Row(
                children: [
                  Icon(
                    _isConnected ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                    color: _isConnected ? EstradaTheme.emerald400 : EstradaTheme.red400,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _isConnected ? 'Conectado a Docker: $_baseUrl' : 'Desconectado del servidor',
                      style: const TextStyle(fontSize: 11, color: EstradaTheme.textLo),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CERRAR', style: TextStyle(color: EstradaTheme.ember500, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _versionRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 95,
            child: Text(
              label,
              style: const TextStyle(color: EstradaTheme.textDim, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: EstradaTheme.textHi, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  void _showServerSettingsDialog() {
    final ctrl = TextEditingController(text: _baseUrl);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text(
                    'CONEXIÓN A DOCKER',
                    style: TextStyle(
                      color: EstradaTheme.ember500,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                  ),
                ],
              ),
              const Text(
                'Servidor PostgreSQL + API Core Go',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Seleccione el punto de enlace hacia los contenedores de Lubricentros Estrada:',
                style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _presetChip('Túnel Cloudflare (Internet)', defaultTunnelUrl, ctrl),
                  _presetChip('Wi-Fi Local (192.168.1.8)', defaultLanUrl, ctrl),
                  _presetChip('Emulador Android', defaultEmulatorUrl, ctrl),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: ctrl,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                decoration: InputDecoration(
                  labelText: 'URL del Servidor (Caddy :8088 o Túnel HTTPS)',
                  labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                  filled: true,
                  fillColor: EstradaTheme.ink950,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EstradaTheme.ember500,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  onPressed: () async {
                    final newUrl = ctrl.text.trim();
                    if (newUrl.isEmpty) return;
                    Navigator.pop(ctx);
                    setState(() {
                      _baseUrl = newUrl;
                      _checkingConnection = true;
                    });
                    final ok = await _pingServer(newUrl);
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setString('estrada_api_base_url', newUrl);
                    setState(() {
                      _isConnected = ok;
                      _checkingConnection = false;
                    });
                    await _loadAllData();
                  },
                  icon: const Icon(Icons.sync_rounded, size: 18),
                  label: const Text(
                    'GUARDAR Y CONECTAR',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _presetChip(String label, String url, TextEditingController ctrl) {
    return ActionChip(
      backgroundColor: EstradaTheme.ink950,
      side: const BorderSide(color: EstradaTheme.borderSubtle),
      label: Text(label, style: const TextStyle(color: Colors.white, fontSize: 11)),
      onPressed: () => ctrl.text = url,
    );
  }

  void _openProductEditorModal({ProductModel? existing, String? prefilledBarcode}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.ink950,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => ProductEditorSheet(
        baseUrl: _baseUrl,
        resolveImageUrl: resolveImageUrl,
        existingProduct: existing,
        prefilledBarcode: prefilledBarcode,
        categories: _categories,
        brands: _brands,
        onSaved: () {
          _fetchProducts();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: EstradaTheme.ink950,
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Text(
                'E',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          color: Colors.white,
                        ),
                        children: [
                          TextSpan(text: 'ESTRAD'),
                          TextSpan(
                            text: 'A',
                            style: TextStyle(color: EstradaTheme.ember500),
                          ),
                          TextSpan(
                            text: ' ERP',
                            style: TextStyle(
                              color: EstradaTheme.textLo,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: _showAppVersionDialog,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: EstradaTheme.ember500.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: EstradaTheme.ember500.withValues(alpha: 0.4)),
                        ),
                        child: const Text(
                          'v${EstradaAppVersion.version}',
                          style: TextStyle(
                            color: EstradaTheme.ember500,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _checkingConnection
                            ? EstradaTheme.amber400
                            : (_isConnected ? EstradaTheme.emerald400 : EstradaTheme.red400),
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _checkingConnection
                          ? 'Conectando a Docker...'
                          : (_isConnected
                              ? 'PostgreSQL Online (${_products.length} SKUs)'
                              : 'Sin conexión — Configurar'),
                      style: const TextStyle(
                        fontSize: 10,
                        color: EstradaTheme.textLo,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refrescar Datos',
            onPressed: _loadAllData,
            icon: const Icon(Icons.refresh_rounded, color: EstradaTheme.textLo, size: 20),
          ),
          IconButton(
            tooltip: 'Configurar Conexión',
            onPressed: _showServerSettingsDialog,
            icon: Icon(
              Icons.settings_ethernet_rounded,
              color: _isConnected ? EstradaTheme.emerald400 : EstradaTheme.amber400,
              size: 20,
            ),
          ),
          const SizedBox(width: 4),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: EstradaTheme.borderSubtle),
        ),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          // TAB 1: FUNCIONALIDAD 1 - ESCANEAR PRODUCTOS PARA SINCRONIZAR INVENTARIO
          InventoryScannerView(
            baseUrl: _baseUrl,
            products: _products,
            resolveImageUrl: resolveImageUrl,
            onRefreshProducts: _fetchProducts,
            onOpenProductEditor: _openProductEditorModal,
          ),

          // TAB 2: FUNCIONALIDAD 2 - ESCANEAR EN VENTA -> CARGA AUTOMÁTICA EN POS WEB + DESCUENTO DE STOCK
          PosScannerLiveView(
            baseUrl: _baseUrl,
            products: _products,
            cart: _posCart,
            resolveImageUrl: resolveImageUrl,
            onCartChanged: () => setState(() {}),
            onSaleCompleted: () {
              setState(() => _posCart.clear());
              _fetchProducts();
            },
          ),

          // TAB 3: CATÁLOGO DE PRODUCTOS & EDITOR CON FOTO DESDE CELULAR O ENLACE URL
          CatalogManagerView(
            baseUrl: _baseUrl,
            products: _products,
            resolveImageUrl: resolveImageUrl,
            onRefresh: _fetchProducts,
            onEditProduct: (prod) => _openProductEditorModal(existing: prod),
            onCreateProduct: () => _openProductEditorModal(),
            onSendToPosWeb: (prod) async {
              await _sendProductToPosWeb(prod);
            },
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: EstradaTheme.panelBg,
          border: Border(top: BorderSide(color: EstradaTheme.borderSubtle)),
        ),
        child: NavigationBar(
          backgroundColor: EstradaTheme.panelBg,
          indicatorColor: EstradaTheme.ember500.withValues(alpha: 0.25),
          selectedIndex: _selectedIndex,
          onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
          destinations: [
            const NavigationDestination(
              icon: Icon(Icons.qr_code_scanner_rounded, color: EstradaTheme.textLo),
              selectedIcon: Icon(Icons.qr_code_scanner_rounded, color: EstradaTheme.ember500),
              label: '1. Sinc. Inventario',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: _posCart.isNotEmpty,
                label: Text('${_posCart.fold(0, (sum, i) => sum + i.quantity)}'),
                backgroundColor: EstradaTheme.ember500,
                child: const Icon(Icons.point_of_sale_rounded, color: EstradaTheme.textLo),
              ),
              selectedIcon: Badge(
                isLabelVisible: _posCart.isNotEmpty,
                label: Text('${_posCart.fold(0, (sum, i) => sum + i.quantity)}'),
                backgroundColor: EstradaTheme.ember500,
                child: const Icon(Icons.point_of_sale_rounded, color: EstradaTheme.ember500),
              ),
              label: '2. Escáner POS',
            ),
            const NavigationDestination(
              icon: Icon(Icons.inventory_2_outlined, color: EstradaTheme.textLo),
              selectedIcon: Icon(Icons.inventory_2_rounded, color: EstradaTheme.ember500),
              label: '3. Productos & Fotos',
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// TAB 1: FUNCIONALIDAD 1 - ESCANEAR PRODUCTOS PARA SINCRONIZAR INVENTARIO
// ============================================================================
class InventoryScannerView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final String Function(String) resolveImageUrl;
  final Future<void> Function({String query}) onRefreshProducts;
  final void Function({ProductModel? existing, String? prefilledBarcode}) onOpenProductEditor;

  const InventoryScannerView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.resolveImageUrl,
    required this.onRefreshProducts,
    required this.onOpenProductEditor,
  });

  @override
  State<InventoryScannerView> createState() => _InventoryScannerViewState();
}

class _InventoryScannerViewState extends State<InventoryScannerView> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    detectionTimeoutMs: 350,
    cameraResolution: const Size(1920, 1080),
    autoZoom: true,
    formats: const [
      BarcodeFormat.ean13,
      BarcodeFormat.ean8,
      BarcodeFormat.code128,
      BarcodeFormat.code39,
      BarcodeFormat.code93,
      BarcodeFormat.upcA,
      BarcodeFormat.upcE,
      BarcodeFormat.qrCode,
      BarcodeFormat.dataMatrix,
      BarcodeFormat.itf14,
    ],
  );
  final TextEditingController _manualCodeCtrl = TextEditingController();

  bool _cameraExpanded = true;
  bool _isProcessingScan = false;
  DateTime? _lastScanTime;
  String? _lastScannedCode;

  @override
  void dispose() {
    _scannerController.dispose();
    _manualCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _lookupBarcode(String rawCode) async {
    final code = rawCode.trim();
    if (code.isEmpty || _isProcessingScan) return;

    final now = DateTime.now();
    if (_lastScanTime != null &&
        _lastScannedCode == code &&
        now.difference(_lastScanTime!).inSeconds < 2) {
      return;
    }
    _lastScanTime = now;
    _lastScannedCode = code;

    setState(() => _isProcessingScan = true);
    HapticFeedback.mediumImpact();

    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;
      final res = await http.get(
        Uri.parse('$clean/v1/products/barcode/${Uri.encodeComponent(code)}'),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] != null) {
          final data = body['data'];
          if (data['found'] == true && data['product'] != null) {
            final prod = ProductModel.fromJson(data['product'] as Map<String, dynamic>);
            _showInventorySyncSheet(prod);
          } else {
            if (mounted) {
              _showNewBarcodeDialog(code);
            }
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: EstradaTheme.red400,
            content: Text('Error consultando código: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessingScan = false);
      }
    }
  }

  void _showNewBarcodeDialog(String barcode) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: EstradaTheme.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.inventory_2_rounded, color: EstradaTheme.amber400, size: 24),
            SizedBox(width: 10),
            Text('Código No Registrado', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'El código de barras "$barcode" no existe aún en el inventario de Lubricentros Estrada en PostgreSQL.\n\n¿Desea registrarlo como un nuevo producto ahora con foto desde la cámara o galería?',
          style: const TextStyle(color: EstradaTheme.textLo, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCELAR', style: TextStyle(color: EstradaTheme.textDim)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: EstradaTheme.ember500,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              widget.onOpenProductEditor(prefilledBarcode: barcode);
            },
            icon: const Icon(Icons.add_a_photo_rounded, size: 16),
            label: const Text('CREAR CON FOTO', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showInventorySyncSheet(ProductModel prod) {
    double tempStock = prod.stockCurrent;
    final noteCtrl = TextEditingController(text: 'Ajuste rápido desde App Móvil');
    String movementType = 'IN';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: EstradaTheme.ember500.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'SINCRONIZACIÓN DE KARDEX',
                          style: TextStyle(
                            color: EstradaTheme.ember500,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 60,
                          height: 60,
                          color: EstradaTheme.ink950,
                          child: Image.network(
                            widget.resolveImageUrl(prod.imageUrl),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => const Icon(
                              Icons.oil_barrel_rounded,
                              color: EstradaTheme.textDim,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              prod.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'SKU: ${prod.sku} • EAN: ${prod.barcode}',
                              style: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                            ),
                            Text(
                              'S/ ${prod.salePrice.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: EstradaTheme.amber400,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EstradaTheme.ink950,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: EstradaTheme.borderSubtle),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Stock Registrado:',
                              style: TextStyle(color: EstradaTheme.textLo, fontSize: 13),
                            ),
                            Text(
                              '${prod.stockCurrent.toStringAsFixed(0)} unidades',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: EstradaTheme.borderSubtle, height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Nuevo Stock a Guardar:',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: EstradaTheme.ember500.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: EstradaTheme.ember500),
                              ),
                              child: Text(
                                '${tempStock.toStringAsFixed(0)} unid.',
                                style: const TextStyle(
                                  color: EstradaTheme.ember500,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _stockBtn('-10', () {
                              if (tempStock >= 10) {
                                setModalState(() => tempStock -= 10);
                              }
                            }),
                            _stockBtn('-1', () {
                              if (tempStock >= 1) {
                                setModalState(() => tempStock -= 1);
                              }
                            }),
                            _stockBtn('+1', () {
                              setModalState(() => tempStock += 1);
                            }),
                            _stockBtn('+5', () {
                              setModalState(() => tempStock += 5);
                            }),
                            _stockBtn('+10', () {
                              setModalState(() => tempStock += 10);
                            }),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: EstradaTheme.borderSubtle),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            Navigator.pop(ctx);
                            widget.onOpenProductEditor(existing: prod);
                          },
                          child: const Text('EDITAR / FOTO', style: TextStyle(color: Colors.white, fontSize: 11)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: EstradaTheme.emerald500,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () async {
                            final delta = tempStock - prod.stockCurrent;
                            movementType = delta >= 0 ? 'IN' : 'OUT';
                            final qty = delta.abs();

                            Navigator.pop(ctx);
                            await _applyStockSync(
                              productId: prod.id,
                              barcode: prod.barcode,
                              movementType: movementType,
                              quantity: qty > 0 ? qty : 0,
                              newTotalStock: tempStock,
                              reason: noteCtrl.text.trim(),
                            );
                          },
                          icon: const Icon(Icons.check_circle_rounded, size: 18),
                          label: const Text(
                            'ACTUALIZAR EN POSTGRESQL',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _stockBtn(String label, VoidCallback onTap) {
    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: EstradaTheme.cardSubtle,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: EstradaTheme.borderSubtle),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Future<void> _applyStockSync({
    required String productId,
    required String barcode,
    required String movementType,
    required double quantity,
    required double newTotalStock,
    required String reason,
  }) async {
    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;
      final res = await http.post(
        Uri.parse('$clean/v1/inventory/scan-sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'product_id': productId,
          'barcode': barcode,
          'movement_type': movementType,
          'quantity': quantity,
          'new_stock_direct': newTotalStock,
          'reason': reason,
        }),
      );

      if (res.statusCode == 200) {
        await widget.onRefreshProducts();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: EstradaTheme.emerald500,
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '¡Stock actualizado a ${newTotalStock.toStringAsFixed(0)} unid. en PostgreSQL!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error guardando stock: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      children: [
        // Encabezado Amigable del Módulo 1
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: EstradaTheme.ember500.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.inventory_2_rounded, color: EstradaTheme.ember500, size: 14),
                  SizedBox(width: 6),
                  Text(
                    'Kardex y Almacén',
                    style: TextStyle(
                      color: EstradaTheme.ember500,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            TextButton.icon(
              style: TextButton.styleFrom(padding: EdgeInsets.zero),
              onPressed: () => setState(() => _cameraExpanded = !_cameraExpanded),
              icon: Icon(
                _cameraExpanded ? Icons.videocam_off_rounded : Icons.videocam_rounded,
                size: 16,
                color: EstradaTheme.amber400,
              ),
              label: Text(
                _cameraExpanded ? 'Ocultar Cámara' : 'Abrir Cámara',
                style: const TextStyle(color: EstradaTheme.amber400, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          'Escaneo de Inventario',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Apunta al código de barras del lubricante o filtro para consultar o ajustar stock al instante.',
          style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
        ),
        const SizedBox(height: 12),

        // Visor de Cámara HD Mejorado con Zoom y Linterna
        if (_cameraExpanded) ...[
          EstradaCameraViewfinder(
            controller: _scannerController,
            height: 250,
            statusHint: _isProcessingScan ? 'Consultando PostgreSQL...' : 'Autoenfoque HD Activo',
            accentColor: EstradaTheme.ember500,
            onBarcodeDetected: _lookupBarcode,
          ),
          const SizedBox(height: 12),
        ],

        // Barra de Búsqueda Manual / Código de Barras
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: EstradaTheme.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: EstradaTheme.borderSubtle),
          ),
          child: Row(
            children: [
              const SizedBox(width: 12),
              const Icon(Icons.qr_code_rounded, color: EstradaTheme.textDim, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _manualCodeCtrl,
                  keyboardType: TextInputType.text,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'Ingresar código de barras manual...',
                    hintStyle: TextStyle(color: EstradaTheme.textDim, fontSize: 12),
                    border: InputBorder.none,
                    isDense: true,
                  ),
                  onSubmitted: _lookupBarcode,
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: EstradaTheme.ember500,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => _lookupBarcode(_manualCodeCtrl.text),
                child: const Text('BUSCAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),
        Row(
          children: [
            const Text(
              'INVENTARIO SINCRONIZADO',
              style: TextStyle(
                color: EstradaTheme.textDim,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
            const Spacer(),
            TextButton.icon(
              style: TextButton.styleFrom(padding: EdgeInsets.zero),
              onPressed: () => widget.onOpenProductEditor(),
              icon: const Icon(Icons.add_a_photo_rounded, color: EstradaTheme.amber400, size: 14),
              label: const Text(
                '+ Nuevo con Foto',
                style: TextStyle(color: EstradaTheme.amber400, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Listado de Productos Sincronizados
        if (widget.products.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: EstradaTheme.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: EstradaTheme.borderSubtle),
            ),
            child: const Center(
              child: Text(
                'Cargando catálogo desde PostgreSQL en Docker...',
                style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
              ),
            ),
          )
        else
          ...widget.products.map((p) => _buildProductRow(p)),
      ],
    );
  }

  Widget _buildProductRow(ProductModel prod) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EstradaTheme.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EstradaTheme.borderSubtle),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 52,
              height: 52,
              color: EstradaTheme.ink950,
              child: Image.network(
                widget.resolveImageUrl(prod.imageUrl),
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Icon(
                  Icons.oil_barrel_rounded,
                  color: EstradaTheme.textDim,
                  size: 24,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prod.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'SKU: ${prod.sku} • EAN: ${prod.barcode}',
                  style: const TextStyle(color: EstradaTheme.textDim, fontSize: 10),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: EstradaTheme.emerald500.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Stock: ${prod.stockCurrent.toStringAsFixed(0)} unid.',
                        style: const TextStyle(
                          color: EstradaTheme.emerald400,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'S/ ${prod.salePrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: EstradaTheme.amber400,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: EstradaTheme.cardSubtle,
              foregroundColor: EstradaTheme.amber400,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: EstradaTheme.borderSubtle),
              ),
            ),
            onPressed: () => _showInventorySyncSheet(prod),
            child: const Text('Sinc. Stock', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// TAB 2: FUNCIONALIDAD 2 - ESCANEAR EN VENTA -> POS WEB + DESCUENTO DE STOCK
// ============================================================================
class PosScannerLiveView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final List<PosCartItem> cart;
  final String Function(String) resolveImageUrl;
  final VoidCallback onCartChanged;
  final VoidCallback onSaleCompleted;

  const PosScannerLiveView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.cart,
    required this.resolveImageUrl,
    required this.onCartChanged,
    required this.onSaleCompleted,
  });

  @override
  State<PosScannerLiveView> createState() => _PosScannerLiveViewState();
}

class _PosScannerLiveViewState extends State<PosScannerLiveView> {
  final MobileScannerController _posScannerCtrl = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    detectionTimeoutMs: 350,
    cameraResolution: const Size(1920, 1080),
    autoZoom: true,
    formats: const [
      BarcodeFormat.ean13,
      BarcodeFormat.ean8,
      BarcodeFormat.code128,
      BarcodeFormat.code39,
      BarcodeFormat.code93,
      BarcodeFormat.upcA,
      BarcodeFormat.upcE,
      BarcodeFormat.qrCode,
      BarcodeFormat.dataMatrix,
      BarcodeFormat.itf14,
    ],
  );

  bool _cameraActive = true;
  bool _sendingScan = false;
  DateTime? _lastPosScanTime;
  String? _lastPosCode;
  String? _lastSyncedMessage;

  @override
  void dispose() {
    _posScannerCtrl.dispose();
    super.dispose();
  }

  Future<void> _scanAndPushToWebPos(String code) async {
    final cleanCode = code.trim();
    if (cleanCode.isEmpty || _sendingScan) return;

    final now = DateTime.now();
    if (_lastPosScanTime != null &&
        _lastPosCode == cleanCode &&
        now.difference(_lastPosScanTime!).inMilliseconds < 1500) {
      return;
    }
    _lastPosScanTime = now;
    _lastPosCode = cleanCode;

    setState(() => _sendingScan = true);
    HapticFeedback.mediumImpact();

    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;
      final res = await http.post(
        Uri.parse('$clean/v1/pos/scan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'barcode': cleanCode,
          'quantity': 1,
          'session_id': 'mobile_live_session',
        }),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] != null) {
          final pJson = body['data']['product'];
          final prod = ProductModel.fromJson(pJson as Map<String, dynamic>);

          final idx = widget.cart.indexWhere((c) => c.product.id == prod.id);
          if (idx >= 0) {
            widget.cart[idx].quantity += 1;
          } else {
            widget.cart.add(PosCartItem(product: prod, quantity: 1));
          }
          widget.onCartChanged();

          setState(() {
            _lastSyncedMessage = 'Cargado en POS Web: ${prod.name} (S/ ${prod.salePrice.toStringAsFixed(2)})';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error enviando a POS Web: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _sendingScan = false);
      }
    }
  }

  void _showCheckoutDialog() {
    if (widget.cart.isEmpty) return;

    final total = widget.cart.fold<double>(0.0, (sum, i) => sum + i.subtotal);
    final count = widget.cart.fold<int>(0, (sum, i) => sum + i.quantity);
    final customerCtrl = TextEditingController(text: 'CLIENTE MOSTRADOR');
    String paymentMethod = 'EFECTIVO';
    bool closingSale = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: EstradaTheme.ember500.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'COBRO DE VENTA POS',
                          style: TextStyle(
                            color: EstradaTheme.ember500,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Cerrar Venta ($count artículos)',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Al confirmar, se emitirá el comprobante y se descontará automáticamente el stock en PostgreSQL.',
                    style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EstradaTheme.ink950,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: EstradaTheme.borderSubtle),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL A COBRAR:', style: TextStyle(color: EstradaTheme.textLo, fontSize: 13, fontWeight: FontWeight.bold)),
                        Text(
                          'S/ ${total.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: EstradaTheme.ember500,
                            fontWeight: FontWeight.w900,
                            fontSize: 22,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: customerCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Cliente / Razón Social',
                      labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                      filled: true,
                      fillColor: EstradaTheme.ink950,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Método de Pago:', style: TextStyle(color: EstradaTheme.textLo, fontSize: 12)),
                  const SizedBox(height: 6),
                  Row(
                    children: ['EFECTIVO', 'YAPE / PLIN', 'TARJETA', 'TRANSFERENCIA'].map((m) {
                      final sel = paymentMethod == m;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ChoiceChip(
                          label: Text(m, style: TextStyle(color: sel ? Colors.white : EstradaTheme.textLo, fontSize: 10, fontWeight: FontWeight.bold)),
                          selected: sel,
                          selectedColor: EstradaTheme.ember500,
                          backgroundColor: EstradaTheme.ink950,
                          onSelected: (_) => setModalState(() => paymentMethod = m),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EstradaTheme.ember500,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: closingSale
                          ? null
                          : () async {
                              setModalState(() => closingSale = true);
                              await _executeSaleClosure(
                                customerName: customerCtrl.text.trim(),
                                paymentMethod: paymentMethod,
                                total: total,
                              );
                              if (ctx.mounted) {
                                Navigator.pop(ctx);
                              }
                            },
                      icon: closingSale
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.receipt_long_rounded, size: 20),
                      label: Text(
                        closingSale ? 'DESCONTANDO STOCK...' : 'CONFIRMAR Y DESCONTAR INVENTARIO',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _executeSaleClosure({
    required String customerName,
    required String paymentMethod,
    required double total,
  }) async {
    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final itemsPayload = widget.cart.map((item) {
        return {
          'product_id': item.product.id,
          'quantity': item.quantity,
          'unit_price': item.product.salePrice,
          'subtotal': item.subtotal,
        };
      }).toList();

      final res = await http.post(
        Uri.parse('$clean/v1/sales'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'customer_name': customerName.isNotEmpty ? customerName : 'CLIENTE MOSTRADOR',
          'payment_method': paymentMethod,
          'total_amount': total,
          'items': itemsPayload,
          'notes': 'Venta cerrada desde Estrada ERP Mobile Scanner',
        }),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onSaleCompleted();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: EstradaTheme.emerald500,
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '¡Venta registrada con éxito y stock descontado en PostgreSQL!',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            duration: Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error al cerrar venta: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.cart.fold<double>(0.0, (sum, i) => sum + i.subtotal);
    final count = widget.cart.fold<int>(0, (sum, i) => sum + i.quantity);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            children: [
              // Encabezado Amigable del Lector POS
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: EstradaTheme.emerald500.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bolt_rounded, color: EstradaTheme.emerald400, size: 14),
                        SizedBox(width: 4),
                        Text(
                          'POS Web en Vivo',
                          style: TextStyle(
                            color: EstradaTheme.emerald400,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _cameraActive ? 'Cámara ON' : 'Cámara OFF',
                        style: const TextStyle(color: EstradaTheme.textDim, fontSize: 11),
                      ),
                      const SizedBox(width: 6),
                      Switch(
                        value: _cameraActive,
                        activeThumbColor: EstradaTheme.ember500,
                        onChanged: (v) => setState(() => _cameraActive = v),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Lector de Caja (POS)',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Los códigos escaneados se cargan de inmediato en la pantalla del POS Web (/admin/pos) para cobrar.',
                style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
              ),
              const SizedBox(height: 12),

              // Banner Verde de Confirmación de Envío en Tiempo Real
              if (_lastSyncedMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: EstradaTheme.emerald500.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: EstradaTheme.emerald400.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: EstradaTheme.emerald400, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _lastSyncedMessage!,
                          style: const TextStyle(
                            color: EstradaTheme.emerald400,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Visor HD de Escáner POS con Zoom Táctil
              if (_cameraActive) ...[
                EstradaCameraViewfinder(
                  controller: _posScannerCtrl,
                  height: 250,
                  statusHint: _sendingScan ? 'Enviando a POS Web...' : 'Escaneo Rápido de Caja',
                  accentColor: EstradaTheme.amber400,
                  onBarcodeDetected: _scanAndPushToWebPos,
                ),
                const SizedBox(height: 14),
              ],

              // Carrito Sincronizado
              Row(
                children: [
                  const Text(
                    'CARRITO EN VIVO',
                    style: TextStyle(
                      color: EstradaTheme.textDim,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const Spacer(),
                  if (widget.cart.isNotEmpty)
                    TextButton(
                      style: TextButton.styleFrom(padding: EdgeInsets.zero),
                      onPressed: () {
                        widget.cart.clear();
                        widget.onCartChanged();
                      },
                      child: const Text('Vaciar', style: TextStyle(color: EstradaTheme.red400, fontSize: 11)),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              if (widget.cart.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: EstradaTheme.cardBg,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: EstradaTheme.borderSubtle),
                  ),
                  child: const Center(
                    child: Column(
                      children: [
                        Icon(Icons.shopping_cart_outlined, color: EstradaTheme.textDim, size: 36),
                        SizedBox(height: 8),
                        Text(
                          'El carrito está vacío.\nEscanea códigos de barras o agrega desde la lista.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ...widget.cart.map((item) => _buildCartItemCard(item)),

              const SizedBox(height: 14),
              const Text(
                'TOQUE RÁPIDO PARA ENVIAR AL POS WEB:',
                style: TextStyle(
                  color: EstradaTheme.textDim,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 8),

              // Chips de Acceso Rápido
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.products.take(6).map((prod) {
                  return InkWell(
                    onTap: () => _scanAndPushToWebPos(prod.barcode.isNotEmpty ? prod.barcode : prod.sku),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: EstradaTheme.cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: EstradaTheme.borderSubtle),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.add_rounded, color: EstradaTheme.amber400, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            prod.name,
                            style: const TextStyle(color: Colors.white, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 80),
            ],
          ),
        ),

        // Barra Fija Inferior de Cobro
        if (widget.cart.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: EstradaTheme.panelBg,
              border: const Border(top: BorderSide(color: EstradaTheme.borderSubtle)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.6),
                  blurRadius: 16,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$count unidades en POS',
                      style: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                    ),
                    Text(
                      'S/ ${total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: EstradaTheme.ember500,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _showCheckoutDialog,
                    icon: const Icon(Icons.point_of_sale_rounded, size: 20),
                    label: const Text(
                      'CERRAR VENTA / COBRAR',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildCartItemCard(PosCartItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EstradaTheme.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EstradaTheme.borderSubtle),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: 44,
              height: 44,
              color: EstradaTheme.ink950,
              child: Image.network(
                widget.resolveImageUrl(item.product.imageUrl),
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.oil_barrel_rounded, color: EstradaTheme.textDim),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'S/ ${item.product.salePrice.toStringAsFixed(2)} c/u • Stock: ${item.product.stockCurrent.toStringAsFixed(0)}',
                  style: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                ),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                visualDensity: VisualDensity.compact,
                onPressed: () {
                  if (item.quantity > 1) {
                    item.quantity -= 1;
                  } else {
                    widget.cart.remove(item);
                  }
                  widget.onCartChanged();
                },
                icon: const Icon(Icons.remove_circle_outline_rounded, color: EstradaTheme.textLo, size: 20),
              ),
              Text(
                '${item.quantity}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                onPressed: () {
                  item.quantity += 1;
                  widget.onCartChanged();
                },
                icon: const Icon(Icons.add_circle_outline_rounded, color: EstradaTheme.ember500, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// TAB 3: CATÁLOGO DE PRODUCTOS & EDITOR CON FOTO DESDE CELULAR O ENLACE URL
// ============================================================================
class CatalogManagerView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final String Function(String) resolveImageUrl;
  final Future<void> Function({String query}) onRefresh;
  final void Function(ProductModel) onEditProduct;
  final VoidCallback onCreateProduct;
  final Future<void> Function(ProductModel) onSendToPosWeb;

  const CatalogManagerView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.resolveImageUrl,
    required this.onRefresh,
    required this.onEditProduct,
    required this.onCreateProduct,
    required this.onSendToPosWeb,
  });

  @override
  State<CatalogManagerView> createState() => _CatalogManagerViewState();
}

class _CatalogManagerViewState extends State<CatalogManagerView> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _selectedCategory = 'TODOS';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = widget.products.where((p) {
      final matchesQuery = _searchCtrl.text.isEmpty ||
          p.name.toLowerCase().contains(_searchCtrl.text.toLowerCase()) ||
          p.sku.toLowerCase().contains(_searchCtrl.text.toLowerCase()) ||
          p.barcode.contains(_searchCtrl.text);

      final matchesCat = _selectedCategory == 'TODOS' ||
          p.categoryName.toUpperCase().contains(_selectedCategory.toUpperCase()) ||
          p.name.toUpperCase().contains(_selectedCategory.toUpperCase());

      return matchesQuery && matchesCat;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: EstradaTheme.ember500,
        foregroundColor: Colors.white,
        elevation: 6,
        onPressed: widget.onCreateProduct,
        icon: const Icon(Icons.add_a_photo_rounded),
        label: const Text('Nuevo Producto', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: EstradaTheme.ember500.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Text(
                  'Catálogo & Fotografías',
                  style: TextStyle(color: EstradaTheme.ember500, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              const Spacer(),
              Text(
                '${filtered.length} SKUs en PostgreSQL',
                style: const TextStyle(color: EstradaTheme.textLo, fontSize: 11, fontFamily: 'monospace'),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Gestión de Productos',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text(
            'Toma fotos de bidones o filtros con la cámara del celular o ingresa enlaces para guardarlos en la base de datos.',
            style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
          ),
          const SizedBox(height: 12),

          // Buscador
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: EstradaTheme.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: EstradaTheme.borderSubtle),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: EstradaTheme.textLo, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Buscar por nombre, SKU o código...',
                      hintStyle: TextStyle(color: EstradaTheme.textDim, fontSize: 12),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                if (_searchCtrl.text.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.close, color: EstradaTheme.textLo, size: 16),
                    onPressed: () {
                      _searchCtrl.clear();
                      setState(() {});
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Chips de Filtro
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['TODOS', 'ACEITES', 'FILTROS', 'GRASAS', 'REFRIGERANTES'].map((c) {
                final sel = _selectedCategory == c;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(c, style: TextStyle(color: sel ? Colors.white : EstradaTheme.textLo, fontSize: 11, fontWeight: FontWeight.bold)),
                    selected: sel,
                    selectedColor: EstradaTheme.ember500,
                    backgroundColor: EstradaTheme.cardBg,
                    side: const BorderSide(color: EstradaTheme.borderSubtle),
                    onSelected: (_) => setState(() => _selectedCategory = c),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),

          // Lista de Tarjetas
          if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: EstradaTheme.cardBg,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: EstradaTheme.borderSubtle),
              ),
              child: const Center(
                child: Text('No se encontraron productos con ese filtro.', style: TextStyle(color: EstradaTheme.textLo)),
              ),
            )
          else
            ...filtered.map((prod) => _buildProductCard(prod)),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildProductCard(ProductModel prod) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: EstradaTheme.cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: EstradaTheme.borderSubtle),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  width: 74,
                  height: 74,
                  color: EstradaTheme.ink950,
                  child: Image.network(
                    widget.resolveImageUrl(prod.imageUrl),
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Center(
                      child: Icon(Icons.oil_barrel_rounded, color: EstradaTheme.textDim, size: 30),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prod.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'SKU: ${prod.sku} • EAN: ${prod.barcode}',
                      style: const TextStyle(color: EstradaTheme.textDim, fontSize: 11),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          'S/ ${prod.salePrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: EstradaTheme.amber400,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: prod.stockCurrent > prod.stockMin
                                ? EstradaTheme.emerald500.withValues(alpha: 0.15)
                                : EstradaTheme.red400.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Stock: ${prod.stockCurrent.toStringAsFixed(0)}',
                            style: TextStyle(
                              color: prod.stockCurrent > prod.stockMin
                                  ? EstradaTheme.emerald400
                                  : EstradaTheme.red400,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: EstradaTheme.borderSubtle),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => widget.onEditProduct(prod),
                  icon: const Icon(Icons.edit_rounded, color: Colors.white70, size: 16),
                  label: const Text('Editar / Foto', style: TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EstradaTheme.cardSubtle,
                    foregroundColor: EstradaTheme.amber400,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: EstradaTheme.borderSubtle),
                    ),
                  ),
                  onPressed: () => widget.onSendToPosWeb(prod),
                  icon: const Icon(Icons.add_shopping_cart_rounded, size: 16),
                  label: const Text('Enviar a POS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// HOJA DE EDICIÓN / REGISTRO DE PRODUCTO CON FOTOGRAFÍA (CÁMARA / GALERÍA)
// ============================================================================
class ProductEditorSheet extends StatefulWidget {
  final String baseUrl;
  final String Function(String) resolveImageUrl;
  final ProductModel? existingProduct;
  final String? prefilledBarcode;
  final List<Map<String, String>> categories;
  final List<Map<String, String>> brands;
  final VoidCallback onSaved;

  const ProductEditorSheet({
    super.key,
    required this.baseUrl,
    required this.resolveImageUrl,
    this.existingProduct,
    this.prefilledBarcode,
    required this.categories,
    required this.brands,
    required this.onSaved,
  });

  @override
  State<ProductEditorSheet> createState() => _ProductEditorSheetState();
}

class _ProductEditorSheetState extends State<ProductEditorSheet> {
  late TextEditingController _nameCtrl;
  late TextEditingController _skuCtrl;
  late TextEditingController _barcodeCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _costCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _stockCtrl;
  late TextEditingController _imageUrlCtrl;

  String? _selectedCategoryId;
  String? _selectedBrandId;
  bool _saving = false;
  bool _uploadingImage = false;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final p = widget.existingProduct;
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _skuCtrl = TextEditingController(text: p?.sku ?? 'LUB-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}');
    _barcodeCtrl = TextEditingController(text: p?.barcode.isNotEmpty == true ? p!.barcode : (widget.prefilledBarcode ?? ''));
    _descCtrl = TextEditingController(text: p?.description ?? '');
    _costCtrl = TextEditingController(text: p != null ? p.purchasePrice.toStringAsFixed(2) : '35.00');
    _priceCtrl = TextEditingController(text: p != null ? p.salePrice.toStringAsFixed(2) : '48.00');
    _stockCtrl = TextEditingController(text: p != null ? p.stockCurrent.toStringAsFixed(0) : '20');
    _imageUrlCtrl = TextEditingController(text: p?.imageUrl ?? '');

    _selectedCategoryId = p?.categoryId;
    _selectedBrandId = p?.brandId;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _skuCtrl.dispose();
    _barcodeCtrl.dispose();
    _descCtrl.dispose();
    _costCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadImage(ImageSource source) async {
    try {
      final xfile = await _picker.pickImage(source: source, maxWidth: 1280, maxHeight: 1280, imageQuality: 85);
      if (xfile == null) return;

      setState(() => _uploadingImage = true);

      final bytes = await xfile.readAsBytes();
      final filename = xfile.name.isNotEmpty ? xfile.name : 'product_${DateTime.now().millisecondsSinceEpoch}.jpg';

      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final req = http.MultipartRequest('POST', Uri.parse('$clean/v1/media/upload'));
      req.files.add(http.MultipartFile.fromBytes('file', bytes, filename: filename));

      final streamedRes = await req.send();
      final res = await http.Response.fromStream(streamedRes);

      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] != null) {
          final savedUrl = body['data']['url']?.toString() ?? '';
          setState(() {
            _imageUrlCtrl.text = savedUrl;
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                backgroundColor: EstradaTheme.emerald500,
                content: Text('¡Fotografía guardada con éxito en PostgreSQL (media_blobs)!'),
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error subiendo imagen: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _uploadingImage = false);
      }
    }
  }

  Future<void> _saveProduct() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ingrese el nombre del producto.')),
      );
      return;
    }

    setState(() => _saving = true);

    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final payload = {
        'name': name,
        'sku': _skuCtrl.text.trim(),
        'barcode': _barcodeCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'purchase_price': double.tryParse(_costCtrl.text.trim()) ?? 0.0,
        'sale_price': double.tryParse(_priceCtrl.text.trim()) ?? 0.0,
        'stock_current': double.tryParse(_stockCtrl.text.trim()) ?? 0.0,
        'stock_min': 5.0,
        'image_url': _imageUrlCtrl.text.trim(),
        'category_id': _selectedCategoryId,
        'brand_id': _selectedBrandId,
      };

      http.Response res;
      if (widget.existingProduct != null) {
        res = await http.put(
          Uri.parse('$clean/v1/products/${widget.existingProduct!.id}'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        );
      } else {
        res = await http.post(
          Uri.parse('$clean/v1/products'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        );
      }

      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onSaved();
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: EstradaTheme.emerald500,
              content: Text('¡Producto "$name" guardado correctamente en PostgreSQL!'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error guardando producto: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existingProduct != null;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: EstradaTheme.ember500.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    isEdit ? 'EDITAR PRODUCTO' : 'REGISTRO DE PRODUCTO',
                    style: const TextStyle(
                      color: EstradaTheme.ember500,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              isEdit ? 'Actualizar Datos y Fotografía' : 'Dar de Alta Nuevo Producto',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 14),

            // SECCIÓN DE FOTOGRAFÍA (CÁMARA / GALERÍA / URL)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: EstradaTheme.cardBg,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: EstradaTheme.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('FOTOGRAFÍA DEL PRODUCTO', style: TextStyle(color: EstradaTheme.amber400, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 70,
                          height: 70,
                          color: EstradaTheme.ink950,
                          child: _uploadingImage
                              ? const Center(child: CircularProgressIndicator(color: EstradaTheme.ember500, strokeWidth: 2))
                              : Image.network(
                                  widget.resolveImageUrl(_imageUrlCtrl.text),
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Center(
                                    child: Icon(Icons.add_a_photo_outlined, color: EstradaTheme.textDim, size: 28),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: EstradaTheme.ember500,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: _uploadingImage ? null : () => _pickAndUploadImage(ImageSource.camera),
                                  icon: const Icon(Icons.camera_alt_rounded, size: 15),
                                  label: const Text('Cámara', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 6),
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: EstradaTheme.borderSubtle),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: _uploadingImage ? null : () => _pickAndUploadImage(ImageSource.gallery),
                                  icon: const Icon(Icons.photo_library_rounded, color: Colors.white, size: 15),
                                  label: const Text('Galería', style: TextStyle(color: Colors.white, fontSize: 11)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Guarda directo en PostgreSQL (BYTEA)',
                              style: TextStyle(color: EstradaTheme.textDim, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _imageUrlCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      labelText: 'O ingresar enlace directo de imagen (URL)',
                      labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                      filled: true,
                      fillColor: EstradaTheme.ink950,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                      ),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // CAMPOS DE DATOS
            TextField(
              controller: _nameCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: _inputDecor('Nombre del Producto (ej. Castrol EDGE 5W-30)'),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _skuCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: _inputDecor('Código SKU'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _barcodeCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: _inputDecor('Código de Barras (EAN)'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _costCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: _inputDecor('Precio Compra (S/)'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _priceCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: _inputDecor('Precio Venta (S/)'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _stockCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: _inputDecor('Stock Actual'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _descCtrl,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: _inputDecor('Descripción técnica / viscosidad...'),
            ),
            const SizedBox(height: 18),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: EstradaTheme.ember500,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _saving ? null : _saveProduct,
                icon: _saving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.save_rounded, size: 20),
                label: Text(
                  _saving ? 'GUARDANDO EN POSTGRESQL...' : (isEdit ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO'),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecor(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
      filled: true,
      fillColor: EstradaTheme.cardBg,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
      ),
    );
  }
}
