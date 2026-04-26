import React from "react";
import { render, screen } from "@testing-library/react";
import MetricCard from "../../features/dashboard/MetricCard.jsx";


// A minimal icon mock — lucide-react icons are SVG React components
const MockIcon = ({ size, ...rest }) => (
  <svg data-testid="metric-icon" aria-hidden="true" width={size} height={size} {...rest} />
);

describe("MetricCard", () => {
  const baseProps = {
    label: "Total Projects",
    value: 42,
    icon: MockIcon,
    color: "emerald",
  };

  it("renders the label text", () => {
    render(<MetricCard {...baseProps} />);
    expect(screen.getByText("Total Projects")).toBeInTheDocument();
  });

  it("renders the numeric value", () => {
    render(<MetricCard {...baseProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the icon component", () => {
    render(<MetricCard {...baseProps} />);
    expect(screen.getByTestId("metric-icon")).toBeInTheDocument();
  });

  it("renders value=0 without crashing (edge case)", () => {
    render(<MetricCard {...baseProps} value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders large numeric values correctly", () => {
    render(<MetricCard {...baseProps} value={99999} />);
    expect(screen.getByText("99999")).toBeInTheDocument();
  });

  it.each(["emerald", "teal", "success", "warning"])(
    "renders without crashing for color=%s",
    (color) => {
      const { container } = render(<MetricCard {...baseProps} color={color} />);
      // The icon wrapper div should exist
      expect(container.querySelector(".metric-card-icon-wrapper")).toBeTruthy();
    }
  );

  it("applies the correct color class based on the color prop", () => {
    const { container } = render(<MetricCard {...baseProps} color="teal" />);
    const wrapper = container.querySelector(".metric-card-icon-wrapper");
    expect(wrapper).toHaveClass("metric-card-teal");
  });

  it("renders different labels independently", () => {
    const { rerender } = render(<MetricCard {...baseProps} label="Total Tasks" value={10} />);
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();

    rerender(<MetricCard {...baseProps} label="Pending Tasks" value={5} />);
    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
    expect(screen.queryByText("Total Tasks")).not.toBeInTheDocument();
  });
});