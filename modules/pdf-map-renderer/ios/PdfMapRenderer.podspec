Pod::Spec.new do |s|
  s.name           = 'PdfMapRenderer'
  s.version        = '1.0.0'
  s.summary        = 'Renders georeferenced PDF pages into map tiles'
  s.description    = 'Renders georeferenced PDF pages into XYZ map tiles (Arena Mobile local module)'
  s.author         = 'Open Foris'
  s.homepage       = 'https://github.com/openforis/arena-mobile'
  s.license        = 'MIT'
  s.platforms      = {
    :ios => '16.4'
  }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
