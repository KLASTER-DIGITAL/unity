/**
 * Component Showcase Page
 *
 * Демонстрация Universal Components для E2E тестирования
 * Доступна только в development режиме
 */

import type React from "react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/universal/Button";
import { Modal } from "@/shared/components/ui/universal/Modal";
import { RadioGroup } from "@/shared/components/ui/universal/RadioGroup";

export const ComponentShowcase: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [radioValue, setRadioValue] = useState("option1");

	const handleLoadingClick = () => {
		setIsLoading(true);
		setTimeout(() => setIsLoading(false), 2000);
	};

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-4xl space-y-12">
				{/* Header */}
				<div className="text-center">
					<h1 className="mb-2 font-bold text-4xl text-foreground">
						Universal Components Showcase
					</h1>
					<p className="text-muted-foreground">
						Демонстрация компонентов для E2E тестирования
					</p>
				</div>

				{/* Button Section */}
				<section className="space-y-6">
					<h2 className="border-border border-b pb-2 font-semibold text-2xl text-foreground">
						Button Component
					</h2>

					{/* Variants */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Variants</h3>
						<div className="flex flex-wrap gap-4">
							<Button variant="default">Default</Button>
							<Button variant="destructive">Destructive</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="link">Link</Button>
						</div>
					</div>

					{/* Sizes */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Sizes</h3>
						<div className="flex flex-wrap items-center gap-4">
							<Button size="sm">Small</Button>
							<Button size="default">Default</Button>
							<Button size="lg">Large</Button>
							<Button size="icon">🔍</Button>
						</div>
					</div>

					{/* States */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">States</h3>
						<div className="flex flex-wrap gap-4">
							<Button disabled>Disabled</Button>
							<Button loading={isLoading} onClick={handleLoadingClick}>
								{isLoading ? "Loading..." : "Click to Load"}
							</Button>
						</div>
					</div>

					{/* With Icons */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">With Icons</h3>
						<div className="flex flex-wrap gap-4">
							<Button leftIcon={<span>←</span>}>Back</Button>
							<Button rightIcon={<span>→</span>}>Next</Button>
						</div>
					</div>

					{/* Full Width */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Full Width</h3>
						<Button fullWidth>Full Width Button</Button>
					</div>
				</section>

				{/* Modal Section */}
				<section className="space-y-6">
					<h2 className="border-border border-b pb-2 font-semibold text-2xl text-foreground">
						Modal Component
					</h2>

					<div className="space-y-4">
						<Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

						<Modal
							closeButton
							closeOnBackdrop
							description="This is a modal description"
							onOpenChange={setIsModalOpen}
							open={isModalOpen}
							title="Example Modal"
						>
							<div className="space-y-4">
								<p className="text-foreground">
									This is the modal content. You can put any content here.
								</p>
								<p className="text-muted-foreground">
									Try clicking the backdrop or pressing Escape to close the
									modal.
								</p>
								<div className="flex justify-end gap-2">
									<Button
										onClick={() => setIsModalOpen(false)}
										variant="outline"
									>
										Cancel
									</Button>
									<Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
								</div>
							</div>
						</Modal>
					</div>

					{/* Different Sizes */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Sizes</h3>
						<div className="flex flex-wrap gap-4">
							<Button onClick={() => setIsModalOpen(true)}>Small Modal</Button>
							<Button onClick={() => setIsModalOpen(true)}>
								Default Modal
							</Button>
							<Button onClick={() => setIsModalOpen(true)}>Large Modal</Button>
						</div>
					</div>
				</section>

				{/* RadioGroup Section */}
				<section className="space-y-6">
					<h2 className="border-border border-b pb-2 font-semibold text-2xl text-foreground">
						RadioGroup Component
					</h2>

					{/* Basic RadioGroup */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Basic</h3>
						<RadioGroup
							onValueChange={setRadioValue}
							options={[
								{ value: "option1", label: "Option 1" },
								{ value: "option2", label: "Option 2" },
								{ value: "option3", label: "Option 3" },
							]}
							value={radioValue}
						/>
						<p className="text-muted-foreground text-sm">
							Selected: {radioValue}
						</p>
					</div>

					{/* Horizontal Orientation */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Horizontal</h3>
						<RadioGroup
							onValueChange={setRadioValue}
							options={[
								{ value: "option1", label: "Option 1" },
								{ value: "option2", label: "Option 2" },
								{ value: "option3", label: "Option 3" },
							]}
							orientation="horizontal"
							value={radioValue}
						/>
					</div>

					{/* Disabled Options */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">Disabled</h3>
						<RadioGroup
							onValueChange={setRadioValue}
							options={[
								{ value: "option1", label: "Option 1" },
								{
									value: "option2",
									label: "Option 2 (Disabled)",
									disabled: true,
								},
								{ value: "option3", label: "Option 3" },
							]}
							value={radioValue}
						/>
					</div>

					{/* With Descriptions */}
					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-lg">
							With Descriptions
						</h3>
						<RadioGroup
							onValueChange={setRadioValue}
							options={[
								{
									value: "option1",
									label: "Option 1",
									description: "This is the first option",
								},
								{
									value: "option2",
									label: "Option 2",
									description: "This is the second option",
								},
								{
									value: "option3",
									label: "Option 3",
									description: "This is the third option",
								},
							]}
							value={radioValue}
						/>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-border border-t pt-8 text-center text-muted-foreground text-sm">
					<p>Component Showcase - Development Only</p>
					<p className="mt-2">React Native Ready: 100% ✅</p>
				</footer>
			</div>
		</div>
	);
};

export default ComponentShowcase;
