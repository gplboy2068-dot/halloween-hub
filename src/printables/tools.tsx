import { PrintableEditor } from "./PrintableEditor";
import {
  bannerConfig, cupcakeTopperConfig, giftTagConfig,
  labelConfig, treatBagConfig, partySignConfig,
} from "./configs";

export const PrintableBanner = () => <PrintableEditor config={bannerConfig} />;
export const PrintableCupcakeTopper = () => <PrintableEditor config={cupcakeTopperConfig} />;
export const PrintableGiftTag = () => <PrintableEditor config={giftTagConfig} />;
export const PrintableLabel = () => <PrintableEditor config={labelConfig} />;
export const PrintableTreatBag = () => <PrintableEditor config={treatBagConfig} />;
export const PrintablePartySign = () => <PrintableEditor config={partySignConfig} />;
