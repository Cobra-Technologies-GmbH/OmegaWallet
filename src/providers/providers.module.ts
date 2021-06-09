import { NgModule } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import {
  ActionSheetProvider,
  AddressBookProvider,
  AddressProvider,
  AnalyticsProvider,
  AppIdentityProvider,
  AppleWalletNg,
  AppleWalletProvider,
  AppProvider,
  BackupProvider,
  BitPayAccountProvider,
  BitPayCardProvider,
  BitPayIdProvider,
  BitPayProvider,
  BuyCryptoProvider,
  BwcErrorProvider,
  BwcProvider,
  CardPhasesProvider,
  ChangellyProvider,
  Clipboard,
  ClipboardProvider,
  CoinbaseProvider,
  ConfettiProvider,
  ConfigProvider,
  CurrencyProvider,
  DerivationPathHelperProvider,
  Device,
  DirectoryProvider,
  DomProvider,
  DownloadProvider,
  DynamicLinksProvider,
  ElectronProvider,
  EmailNotificationsProvider,
  ErrorsProvider,
  ExchangeCryptoProvider,
  ExternalLinkProvider,
  FCMNG,
  FeedbackProvider,
  FeeProvider,
  File,
  FilterProvider,
  FingerprintAIO,
  GiftCardProvider,
  HomeIntegrationsProvider,
  IABCardProvider,
  InAppBrowserProvider,
  IncomingDataProvider,
  InvoiceProvider,
  KeyProvider,
  LanguageLoader,
  LanguageProvider,
  LaunchReview,
  LocationProvider,
  Logger,
  LogsProvider,
  MerchantProvider,
  NewFeatureData,
  OmegaIdProvider,
  OnGoingProcessProvider,
  PayproProvider,
  PersistenceProvider,
  PlatformProvider,
  PopupProvider,
  ProfileProvider,
  PushNotificationsProvider,
  QRScanner,
  RateProvider,
  ReleaseProvider,
  ReplaceParametersProvider,
  ScanProvider,
  ScreenOrientation,
  // SimplexProvider,
  SocialSharing,
  SplashScreen,
  StatusBar,
  TabProvider,
  ThemeProvider,
  TimeProvider,
  Toast,
  TouchIdProvider,
  TxConfirmNotificationProvider,
  TxFormatProvider,
  UserAgent,
  Vibration,
  WalletConnectProvider,
  WalletProvider,
  WyreProvider
} from './index';

@NgModule({
  providers: [
    ActionSheetProvider,
    AddressProvider,
    AddressBookProvider,
    AnalyticsProvider,
    AppleWalletNg,
    AppleWalletProvider,
    AppProvider,
    AppIdentityProvider,
    BackupProvider,
    BitPayProvider,
    BitPayCardProvider,
    BitPayIdProvider,
    BitPayAccountProvider,
    OmegaIdProvider,
    BuyCryptoProvider,
    BwcProvider,
    BwcErrorProvider,
    ChangellyProvider,
    ConfettiProvider,
    ConfigProvider,
    CoinbaseProvider,
    Clipboard,
    ClipboardProvider,
    CurrencyProvider,
    DerivationPathHelperProvider,
    Device,
    DirectoryProvider,
    DomProvider,
    DownloadProvider,
    DynamicLinksProvider,
    ErrorsProvider,
    ExchangeCryptoProvider,
    ExternalLinkProvider,
    FeedbackProvider,
    FCMNG,
    HomeIntegrationsProvider,
    NewFeatureData,
    IABCardProvider,
    InAppBrowserProvider,
    FeeProvider,
    FingerprintAIO,
    GiftCardProvider,
    IncomingDataProvider,
    InvoiceProvider,
    KeyProvider,
    LanguageLoader,
    LanguageProvider,
    LaunchReview,
    LocationProvider,
    Logger,
    LogsProvider,
    ElectronProvider,
    MerchantProvider,
    OnGoingProcessProvider,
    PayproProvider,
    PlatformProvider,
    ProfileProvider,
    PopupProvider,
    QRScanner,
    PushNotificationsProvider,
    RateProvider,
    ReplaceParametersProvider,
    ReleaseProvider,
    // SimplexProvider,
    StatusBar,
    SplashScreen,
    ScanProvider,
    ScreenOrientation,
    SocialSharing,
    TabProvider,
    Toast,
    Vibration,
    ThemeProvider,
    TimeProvider,
    TouchIdProvider,
    TxConfirmNotificationProvider,
    FilterProvider,
    TxFormatProvider,
    UserAgent,
    WalletProvider,
    WalletConnectProvider,
    WyreProvider,
    EmailNotificationsProvider,
    DecimalPipe,
    PersistenceProvider,
    File,
    CardPhasesProvider
  ]
})
export class ProvidersModule {}
