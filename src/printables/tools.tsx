import { PrintableEditor } from "./PrintableEditor";
import {
  bannerConfig, cupcakeTopperConfig, giftTagConfig,
  labelConfig, treatBagConfig, partySignConfig,
  candyBarWrapperConfig, envelopeLinerConfig, ticketConfig, awardCertificateConfig,
  bingoCardConfig, countdownCalendarConfig, trickOrTreatSignConfig, pumpkinGuessConfig, scavengerHuntConfig,
} from "./configs";

export const PrintableBanner = () => <PrintableEditor config={bannerConfig} />;
export const PrintableCupcakeTopper = () => <PrintableEditor config={cupcakeTopperConfig} />;
export const PrintableGiftTag = () => <PrintableEditor config={giftTagConfig} />;
export const PrintableLabel = () => <PrintableEditor config={labelConfig} />;
export const PrintableTreatBag = () => <PrintableEditor config={treatBagConfig} />;
export const PrintablePartySign = () => <PrintableEditor config={partySignConfig} />;
export const PrintableCandyBarWrapper = () => <PrintableEditor config={candyBarWrapperConfig} />;
export const PrintableEnvelopeLiner = () => <PrintableEditor config={envelopeLinerConfig} />;
export const PrintableTicket = () => <PrintableEditor config={ticketConfig} />;
export const PrintableAwardCertificate = () => <PrintableEditor config={awardCertificateConfig} />;
export const PrintableBingoCard = () => <PrintableEditor config={bingoCardConfig} />;
export const PrintableCountdownCalendar = () => <PrintableEditor config={countdownCalendarConfig} />;
export const PrintableTrickOrTreatSign = () => <PrintableEditor config={trickOrTreatSignConfig} />;
export const PrintablePumpkinGuess = () => <PrintableEditor config={pumpkinGuessConfig} />;
export const PrintableScavengerHunt = () => <PrintableEditor config={scavengerHuntConfig} />;
