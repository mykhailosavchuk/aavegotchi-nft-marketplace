import { decimals } from "../config/constances";

export const shapeAddress = (str, n = 4) => {
  if (str) {
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
  }
  return "";
};

export const formatPrice = (price) => {
  return price/Math.pow(10, decimals);
}
