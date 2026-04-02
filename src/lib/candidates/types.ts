import type {
  ConnectorKind,
  ConnectorSignal,
  ConnectorStatus as BaseConnectorStatus,
} from "@/lib/connectors/types";

export type ExternalLinkType = "official" | "purchase" | "reference" | "raffle";
export type CandidateSortOption = "score" | "margin" | "profit" | "recent";

export interface ExternalLink {
  id: string;
  type: ExternalLinkType;
  label: string;
  url: string;
  notes?: string;
}

export interface CandidateCatalogEntry {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  thumbnailUrl: string;
  shortDescription: string;
  estimatedBuyPrice: number;
  estimatedSellPrice: number;
  shippingCost: number;
  otherCost: number;
  riskFlags: string[];
  externalLinks: ExternalLink[];
}

export interface ProfitBreakdown {
  sellPrice: number;
  buyPrice: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  shippingCost: number;
  otherCost: number;
  costBasis: number;
  netProfit: number;
  marginRate: number;
  roiRate: number;
  breakevenSalePrice: number;
}

export interface ScoreComponent {
  key: string;
  label: string;
  value: number;
  rationale: string;
}

export interface ScoreBreakdown {
  total: number;
  summary: string;
  components: ScoreComponent[];
  risks: string[];
}

export type ConnectorStatus = BaseConnectorStatus;

export interface CandidateRecord extends CandidateCatalogEntry {
  lastObservedAt: string | null;
  signals: ConnectorSignal[];
  profit: ProfitBreakdown;
  score: ScoreBreakdown;
}

export interface CandidateFilters {
  search?: string;
  category?: string;
  source?: ConnectorKind | "all";
  sort?: CandidateSortOption;
}
