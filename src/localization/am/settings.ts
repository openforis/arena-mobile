export default {
  title: "ቅንብሮች",
  group: {
    appearance: "መልክ",
    dataEntry: "ውሂብ ማስገባት",
    location: "አካባቢ እና ጂፒኤስ",
    images: "ምስሎች",
  },
  animationsEnabled: {
    label: "አኒሜሽኖች ነቅተዋል",
    description:
      "በመተግበሪያው ውስጥ የሽግግር እና የገጽታ አኒሜሽኖችን ያነቃል። በዝግተኛ መሣሪያዎች ላይ አፈጻጸምን ለማሻሻል ያሰናክሉት",
  },
  connectionToServer: "ከአገልጋይ ጋር ግንኙነት",
  fontScale: {
    label: "የቅርጸ ቁምፊ መጠን (ቤታ)፡ {{value}}",
    description: "በመተግበሪያው ውስጥ የሚያገለግለውን የጽሑፍ መጠን ያስተካክላል",
  },
  keepScreenAwake: {
    label: "ማያ ገጹን ነቅቶ ያቆዩት",
    description: "መተግበሪያው ክፍት እያለ ማያ ገጹ በራስ-ሰር እንዳይጠፋ ይከላከላል",
  },
  fullScreen: {
    label: "ሙሉ ማያ ገጽ",
    description: "ውሂብ ለማስገባት ሙሉውን ማያ ገጽ ለመጠቀም የስርዓት ሁኔታ እና የአሰሳ አሞሌዎችን ይደብቃል",
  },
  imageSizeLimit: {
    label: "የምስሎች መጠን እስከ: {{value}}MB የተገደበ ነው።",
    description:
      "ጥናቱ ለተወሰነ ባህሪ ትንሽ ገደብ ካላስቀመጠ በስተቀር፣ ምስሎች ከመቀመጣቸው በፊት የሚቀነሱበት ከፍተኛ መጠን",
  },
  imageSizeUnlimited: {
    label: "የምስሎች መጠን ያልተገደበ",
    description:
      "የምስሎች መጠን በመሣሪያው በሚሰጠው ከፍተኛ ጥራት ይቀመጣል፣ በዳሰሳ ጥናት ቅጽ ዲዛይነር ላይ ገደብ ካልተቀመጠ በስተቀር።",
  },
  language: {
    label: "የመተግበሪያ ቋንቋ",
    description: "በመተግበሪያው በይነገጽ ውስጥ የሚያገለግለውን ቋንቋ ያዘጋጃል",
  },
  locationAccuracyThreshold: {
    label: "የቦታ ትክክለኛነት ገደብ (ሜትሮች)",
    description:
      "ለተቀናጀ ባህሪ የቦታ ንባብ ተቀባይነት ከማግኘቱ በፊት የሚያስፈልገው ዝቅተኛ የጂፒኤስ ትክክለኛነት (በሜትር)",
  },
  locationAccuracyWatchTimeout: {
    label: "የቦታ ትክክለኛነት ክትትል ጊዜ ማብቂያ፡ {{value}} ሰከንዶች",
    description: "ትክክለኛነት ገደቡን የሚያሟላ የቦታ ንባብ ከመተው በፊት ለመጠበቅ ከፍተኛ ጊዜ",
  },
  locationAveragingEnabled: {
    label: "የቦታ አማካይ ተንቀሳቅሷል",
    description: "ሲነቃ የተመዘገበው ቦታ ከብዙ የቦታ ንባቦች አማካይ ይሆናል፣ ይህም ትክክለኛነትን ያሻሽላል",
  },
  locationGpsLocked: {
    label: "ጂፒኤስ ተቆልፏል (ቤታ)",
    description:
      "ማስጠንቀቂያ፡ የባትሪ ፍጆታ ይጨምራል!\nመተግበሪያው በሚሠራበት ጊዜ የጂፒኤስ ምልክት ይቆለፋል።\nይህም በተቀናጀ ባህሪያት ውስጥ የተሻለ ትክክለኛነት ለማግኘት ይረዳል።",
    error: "የጂፒኤስ መቆለፊያን መጀመር አልተቻለም፡ የአካባቢ አቅራቢ የለም ወይም ወደ አካባቢው መዳረሻ አልተሰጠም",
  },
  gpsDevicePairing: {
    title: "የጂፒኤስ መሣሪያ ማጣመር",
    scanButton: "መሣሪያዎችን ፈልግ",
    scanningLabel: "በአቅራቢያ ያሉ መሣሪያዎችን በመፈለግ ላይ…",
    scanAgainButton: "እንደገና ፈልግ",
    emptyResult:
      "ምንም መሣሪያ አልተገኘም። የጂፒኤስ መቀበያዎ በርቶ እና በማጣመሪያ ሁነታ ላይ መሆኑን ያረጋግጡ።",
    scanFailed: "በፍለጋ ወቅት ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    recognizedDevicesNotice: "እንደ ጂፒኤስ መቀበያ የታወቁ መሣሪያዎች ብቻ ይታያሉ።",
    pairedDevicesTitle: "የተጣመሩ መሣሪያዎች",
    newDevicesTitle: "አዲስ መሣሪያዎች",
    pairButton: "አጣምር",
    pairing: "በማጣመር ላይ…",
    pairingSucceeded: "ከ{{name}} ጋር ተጣምሯል",
    pairingFailed: "ከ{{name}} ጋር ማጣመር አልተቻለም",
    bluetoothDisabled: "ብሉቱዝ ጠፍቷል።",
    enableBluetoothButton: "ብሉቱዝን አብራ",
    permissionDenied: "መሣሪያዎችን ለመፈለግ የብሉቱዝ ፈቃድ ያስፈልጋል።",
    openSettingsButton: "የመተግበሪያ ቅንብሮችን ክፈት",
  },
  preferredGpsSourceId: {
    label: "የጂፒኤስ ምንጭ",
    description:
      "መጋጠሚያዎችን ለመመዝገብ የትኛው ጂፒኤስ ጥቅም ላይ እንደሚውል ይምረጡ፡ የስልኩ ውስጣዊ ጂፒኤስ ወይም የተጣመረ ውጫዊ ጂፒኤስ መቀበያ (ለምሳሌ Bad Elf)።",
    auto: "ራስ-ሰር (ካለ ውጫዊ)",
    internal: "ውስጣዊ ጂፒኤስ",
    pairNewDevice: "አዲስ መሣሪያ አጣምር…",
  },

  showRecordCompletion: {
    label: "የመዝገብ ማጠናቀቅ እድገትን አሳይ",
    description: "ለአሁኑ መዝገብ የተሟሉ መስፈርቶች መቶኛን የሚያሳይ የእድገት አሞሌ ያሳያል",
  },
  showStatusBar: {
    label: "የሁኔታ አሞሌን አሳይ",
    description: "መዝገብ በሚስተካከልበት ጊዜ የባትሪ፣ የማከማቻ እና የአውታረ መረብ ሁኔታን ያሳያል",
  },
  theme: {
    label: "ገጽታ",
    description: "በመተግበሪያው በይነገጽ ውስጥ የሚያገለግለውን የቀለም ገጽታ ያዘጋጃል",
    auto: "ራስ-ሰር",
    dark: "ጨለማ",
    dark2: "ጨለማ 2",
    light: "ብርሃን",
    light2: "ብርሃን 2",
  },
};
